import { FileUserAccessControlPermissions, userHasFilePermission } from 'common-lib';
import * as React from 'react';
import { FileDisplayProps } from './DriveFileDisplay';
import fetchApi from '../../lib/apis';

export default class DriveFolderDisplay extends React.Component<
	FileDisplayProps & { refresh: () => void },
	{ hovering: boolean }
> {
	public state = {
		hovering: false
	};

	constructor(props: FileDisplayProps & { refresh: () => void }) {
		super(props);

		this.handleDrop = this.handleDrop.bind(this);
		this.handleOff = this.handleOff.bind(this);
		this.handleOver = this.handleOver.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
	}

	public render() {
		return (
			<div
				className={`drive-folder-display ${this.props.selected ? 'selected' : ''} ${
					this.state.hovering ? 'hovering' : ''
				}`}
				onClick={() => this.props.onSelect(this.props.file)}
				onDragOver={this.handleOver}
				onDragEnd={this.handleOff}
				onDragLeave={this.handleOff}
				onDragEnter={this.handleOver}
				onDrop={this.handleDrop}
				draggable={true}
				onDragStart={this.handleDragStart}
			>
				{this.props.file.fileName}
			</div>
		);
	}

	private handleOver(e: React.DragEvent<HTMLDivElement>) {
		e.stopPropagation();
		e.preventDefault();

		if (
			!userHasFilePermission(FileUserAccessControlPermissions.WRITE)(this.props.member)(
				this.props.file
			)
		) {
			return;
		}

		this.setState({
			hovering: true
		});
	}

	private handleOff() {
		this.setState({
			hovering: false
		});
	}

	private async handleDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();
		e.stopPropagation();

		if (
			!userHasFilePermission(FileUserAccessControlPermissions.WRITE)(this.props.member)(
				this.props.file
			)
		) {
			return;
		}

		const id = e.dataTransfer.getData('text');

		if (id === this.props.file.parentID) {
			return;
		}

		if (id === this.props.file.id) {
			return;
		}

		if (!id.match(/^[0-9a-f]{32}$/)) {
			return;
		}

		if (!this.props.member) {
			return;
		}

		await fetchApi.files.children.add(
			{ parentid: this.props.file.id },
			{ childid: id },
			this.props.member.sessionID
		);

		this.props.refresh();
		this.setState({
			hovering: false
		});
	}

	private handleDragStart(e: React.DragEvent<HTMLDivElement>) {
		e.dataTransfer.setData('text', this.props.file.id);
	}
}