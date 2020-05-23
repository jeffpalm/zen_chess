import React, { Component } from 'react'

export default class Square extends Component {
	render() {
		const { color, piece, rotation, square, action, marker, pms } = this.props
		// console.log(action)
		return (
			<div
				className={`Square flex ${color} ${piece} ${rotation} ${pms}`}
				onClick={action}
				id={square}>
				{marker ? <span className='marker'>{marker}</span> : null}
			</div>
		)
	}
}
