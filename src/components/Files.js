import React, { Component } from 'react';

export default class Files extends Component {
	generate() {
		const { fileNames } = this.props;
		return fileNames
			.map((e, i) => (
				<div className='File-marker markers' key={i}>
					{e}
				</div>
			))
			.reverse();
	}
	render() {
		return <div className='Files flex center mid'>{this.generate()}</div>;
	}
}
