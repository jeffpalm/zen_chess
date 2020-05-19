import React, { Component } from 'react'
import axios from 'axios'
import Square from './Square'
import Files from './Files'
import Ranks from './Ranks'

export default class Board extends Component {
	constructor(props) {
		super(props)

		this.state = {
			file: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' ],
			board: {},
			drawOrder: [
				'a8',
				'b8',
				'c8',
				'd8',
				'e8',
				'f8',
				'g8',
				'h8',
				'a7',
				'b7',
				'c7',
				'd7',
				'e7',
				'f7',
				'g7',
				'h7',
				'a6',
				'b6',
				'c6',
				'd6',
				'e6',
				'f6',
				'g6',
				'h6',
				'a5',
				'b5',
				'c5',
				'd5',
				'e5',
				'f5',
				'g5',
				'h5',
				'a4',
				'b4',
				'c4',
				'd4',
				'e4',
				'f4',
				'g4',
				'h4',
				'a3',
				'b3',
				'c3',
				'd3',
				'e3',
				'f3',
				'g3',
				'h3',
				'a2',
				'b2',
				'c2',
				'd2',
				'e2',
				'f2',
				'g2',
				'h2',
				'a1',
				'b1',
				'c1',
				'd1',
				'e1',
				'f1',
				'g1',
				'h1'
			],
			dark: 'dark',
			light: 'light',
			curPos: [],
			moves: [],
			preMove: false
		}
		this.drawBoard = this.drawBoard.bind(this)
		this.preMove = this.preMove.bind(this)
	}

	// Iterates through the rank and file arrays in state to draw the board in a way
	// that matches up to FEN notation

	drawBoard() {
		let output = []
		const { drawOrder, dark, light, moves, preMove, board, curPos } = this.state
		for (let i = 0; i < drawOrder.length; i++) {
			const sqName = drawOrder[i]
			const isValidMove = moves.find(e => e.newSq === sqName)
			let type = 'passive'
			if (preMove) {
				type = 'invalid'
				if (isValidMove) type = isValidMove.type
			}
			if (curPos) {
				output.push(
					<Square
						preMove={this.preMove}
						moveType={type}
						rot={this.props.rot}
						piece={curPos[i]}
						key={sqName}
						color={board[sqName] ? board[sqName].color : light}
						square={sqName}
					/>
				)
			} else {
				output.push(
					<Square
						preMove={this.preMove}
						moveType={type}
						rot={this.props.rot}
						piece=''
						key={sqName}
						color={board[sqName] ? board[sqName].color : dark}
						square={sqName}
					/>
				)
			}
		}
		return output
	}

	preMove(e) {
		const postBody = { square: e.target.id }
		axios
			.post('http://localhost:3500/game/moves', postBody)
			.then(res => this.setState({ moves: res.data.moves, preMove: true }))
			.catch(err => console.log(err))
	}

	componentDidMount() {
		const postBody = { fen: this.props.fen }
		axios
			.post('http://localhost:3500/game', postBody)
			.then(res => this.setState({ curPos: res.data.pos, board: res.data.board}))
			.catch(err => console.log(err))
	}

	render() {
		const board = this.drawBoard()
		console.log(this.state)
		const { rot } = this.props
		return (
			<div className={'flex Ranks ' + rot}>
				<Ranks />
				<div className='Board flex'>
					{board}
					<Files fileNames={this.state.file} />
				</div>
			</div>
		)
	}
}
