import React, { Component } from 'react'
import Button from './Button'

export default class GameOver extends Component {
	constructor() {
		super()

		this.state = {}
	}

	render() {
		const { status, newGame, outcome } = this.props
		return (
			<div className='game-over'>
				<h1 id='game-over-heading'>such zen</h1>
				<h2 id='game-over-type'>
					{status === 'mate'
						? outcome === '1-0'
							? 'white wins by checkmate'
							: 'black wins by checkmate'
						: status === 'resign'
						? outcome === '1-0'
							? 'black wins, white resigns'
							: 'white wins, black resigns'
						: 'that is a draw'}
				</h2>
				<Button
					text='new game'
					cn='game-sel'
					fn={newGame}
					btnid='game-over-btn'
				/>
			</div>
		)
	}
}
