import { NHQ } from 'common-lib';
import { convertNHQDate } from '..';
import { CAPWATCHError, CAPWATCHModule } from '../ImportCAPWATCHFile';

const mbrAchievements: CAPWATCHModule<NHQ.MbrAchievements> = async (fileData, schema) => {
	if (typeof fileData[0].CAPID === 'undefined') {
		return CAPWATCHError.BADDATA;
	}

	let values: NHQ.MbrAchievements;

	try {
		const mbrAchievementsCollection = schema.getCollection<NHQ.MbrAchievements>(
			'NHQ_MbrAchievements'
		);

		const clearedORGIDs: { [key: string]: boolean } = {};

		for (const achv of fileData) {
			if (!clearedORGIDs[achv.ORGID]) {
				try {
					await mbrAchievementsCollection
						.remove('ORGID = :ORGID')
						.bind('ORGID', parseInt(achv.ORGID + '', 10))
						.execute();
				} catch (e) {
					console.warn(e);
					return CAPWATCHError.CLEAR;
				}

				clearedORGIDs[achv.ORGID] = true;
			}

			values = {
				CAPID: parseInt(achv.CAPID.toString(), 10),
				AchvID: parseInt(achv.AchvID.toString(), 10),
				AuthByCAPID: parseInt(achv.AuthByCAPID.toString(), 10),
				AuthDate: +convertNHQDate(achv.AuthDate.toString()),
				AuthReason: achv.AuthReason,
				Completed: parseInt(achv.Completed.toString(), 10),
				DateCreated:
					achv.DateCreated.toString() === 'NTC'
						? +Date.now()
						: +convertNHQDate(achv.DateCreated.toString()),
				DateMod: +convertNHQDate(achv.DateMod.toString()),
				Expiration: +convertNHQDate(achv.Expiration.toString()),
				FirstUsr: achv.FirstUsr,
				ORGID: parseInt(achv.ORGID.toString(), 10),
				OriginallyAccomplished: +convertNHQDate(achv.OriginallyAccomplished.toString()),
				RecID: parseInt(achv.RecID.toString(), 10),
				Source: achv.Source,
				Status: achv.Status,
				UsrID: achv.UsrID,
			};

			await mbrAchievementsCollection.add(values).execute();
		}

		return CAPWATCHError.NONE;
	} catch (e) {
		console.warn(e);
		return CAPWATCHError.INSERT;
	}
};

export default mbrAchievements;