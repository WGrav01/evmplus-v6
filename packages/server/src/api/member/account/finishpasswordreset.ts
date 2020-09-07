/**
 * Copyright (C) 2020 Andrew Rioux
 *
 * This file is part of CAPUnit.com.
 *
 * CAPUnit.com is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * CAPUnit.com is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CAPUnit.com.  If not, see <http://www.gnu.org/licenses/>.
 */

import { ServerAPIEndpoint } from 'auto-client-api';
import { always, api } from 'common-lib';
import { PAM } from 'server-common';
import {
	addPasswordForUser,
	createSessionForUser,
	getInformationForUser,
	removePasswordValidationToken,
	simplifyUserInformation,
} from 'server-common/dist/member/pam';

export const func: ServerAPIEndpoint<api.member.account.FinishPasswordReset> = req =>
	PAM.validatePasswordResetToken(req.mysqlx, req.body.token)
		.flatMap(username =>
			addPasswordForUser(req.mysqlx, username, req.body.newPassword).map(always(username)),
		)
		.flatMap(username =>
			removePasswordValidationToken(req.mysqlx, req.body.token).map(always(username)),
		)
		.map(username => getInformationForUser(req.mysqlx, username))
		.map(simplifyUserInformation)
		.flatMap(account => createSessionForUser(req.mysqlx, account))
		.map(session => ({ sessionID: session.id }));

export default func;
