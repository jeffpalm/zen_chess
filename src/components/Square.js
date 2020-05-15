import React, { Component } from 'react';

export default class Square extends Component {
	render() {
		return (
			<div
				className={`Square flex ${this.props.color} ${this.props.piece}`}
				id={`${this.props.file}${this.props.rank}`}>
			</div>
		);
	}
}
