import React, { Component } from 'react'
import Button from './Button'

const Filters = {}
Filters.getPixels = img => {}

export default class GameOver extends Component {
	constructor() {
		super()

		this.state = {}
	}

	render() {
		const { outcome, newGame } = this.props
		return (
			<div className='game-over'>
				<h1 id='game-over-heading'>such zen</h1>
				<h2 id='game-over-type'>
					that's a {outcome === 'mate' ? 'checkmate' : 'draw'}
				</h2>
				<Button text='New Game' cn='game-sel' fn={newGame} btnid='game-over-btn' />
			</div>
		)
	}
}
