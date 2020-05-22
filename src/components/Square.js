import React, { Component } from 'react'

export default class Square extends Component {
	render() {
		const { color, piece, rot, moveType, square, preMove, valid } = this.props
		return (
			<div
				className={`Square flex ${color} ${piece} ${rot} ${moveType} ${valid}`}
				onClick={preMove}
				id={square}></div>
		)
	}
}
