import React, { Component } from 'react'

export default class Square extends Component {
	render() {
		const { color, piece, rot, type, square, preMove, valid } = this.props
		return (
			<div
				className={`Square flex ${color} ${piece} ${rot} ${type}`}
				onClick={preMove}
				id={square}></div>
		)
	}
}
