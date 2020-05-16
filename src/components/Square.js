import React, { Component } from 'react';

export default class Square extends Component {
	render() {
		const { color, piece, rot, file, rank } = this.props
		return (
			<div
				className={`Square flex ${color} ${piece} ${rot}`}
				id={`${file}${rank}`}>
			</div>
		);
	}
}
