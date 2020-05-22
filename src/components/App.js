import React, { Component } from 'react'
import Board from './Board'
import './reset.css'
import './App.css'

export default class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			active: 'w',
			castling: 'KQkq',
			enPassantTarget: '',
			halfMoveClock: 0,
			fullMoveClock: 1,
			rot: 'wht'
		}

		this.uniUpdate = this.uniUpdate.bind(this)
	}

	uniUpdate(val, key) {
		this.setState({ [key]: val })
	}

	flipBoard = () =>
		this.state.rot === 'wht' ? this.setState({ rot: 'blk' }) : this.setState({ rot: 'wht' })

	render() {
		return (
			<div className='App flex center col'>
				<Board rot={this.state.rot} fen={this.state.fen} />
			</div>
		)
	}
}
