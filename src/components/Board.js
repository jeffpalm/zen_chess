import React, { Component } from 'react'
import axios from 'axios'
import Square from './Square'
import Files from './Files'
import Ranks from './Ranks'
import stBoard from '../assets/data/starting_chess_board.json'
import drawOrder from '../assets/data/board_draw_order.json'

export default class Board extends Component {
	constructor(props) {
		super(props)

		this.state = {
			file: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
			board: JSON.parse(JSON.stringify(stBoard)),
			drawOrder: JSON.parse(JSON.stringify(drawOrder)),
			dark: 'dark',
			light: 'light',
			curPos: [],
			moves: [],
			preMove: false,
			preMoveSquare: '',
			cvm: [],
			mounted: false
		}
		this.drawBoard = this.drawBoard.bind(this)
		this.squareClick = this.squareClick.bind(this)
	}

	// Iterates through the rank and file arrays in state to draw the board in a way
	// that matches up to FEN notation

	drawBoard() {
		let output = []
		const { drawOrder, dark, light, moves, preMove, board, curPos } = this.state
		for (let i = 0; i < drawOrder.length; i++) {
			const sqI = board.findIndex(e => e.square === drawOrder[i])
			const sqName = board[sqI].square
			const isValidMove = moves.find(e => e.newSq === sqName)
			const cvmIndex = this.state.cvm.findIndex(e => e.origin === sqName)

			let type
			if (preMove) {
				type = 'invalid'
				if (isValidMove) type = isValidMove.type
			} else {
				cvmIndex === -1 ? type = 'invalid' : type = 'passive'
			}
			if (curPos) {
				output.push(
					<Square
						preMove={this.squareClick}
						moveType={type}
						rot={this.props.rot}
						piece={curPos[i]}
						key={sqName}
						color={board[sqI].color}
						square={sqName}
					/>
				)
			} else {
				output.push(
					<Square
						preMove={this.squareClick}
						moveType={type}
						rot={this.props.rot}
						piece=''
						key={sqName}
						color={board[sqI].color}
						square={sqName}
					/>
				)
			}
		}
		return output
	}

	squareClick(e) {
		if (this.state.preMove) {
			this.setState({
				moves: [],
				preMove: false,
				preMoveSquare: ''
			})
		} else {
			this.setState({
				moves: this.state.cvm.filter(move => move.origin === e.target.id),
				preMove: true,
				preMoveSquare: e.target.id
			})
		}
	}

	componentDidMount() {
		const postBody = { fen: this.props.fen }
		axios
			.post('/api/game', postBody)
			.then(res =>
				this.setState({ curPos: res.data.pos, board: res.data.board, cvm: res.data.cvm, mounted: true })
			)
			.catch(err => console.log(err))
	}

	render() {
		console.log(this.state)
		const { rot } = this.props
		return (
			<div className={'flex Ranks ' + rot}>
				<Ranks />
				<div className='Board flex'>
					{this.state.mounted ? this.drawBoard() : ''}
					<Files fileNames={this.state.file} />
				</div>
			</div>
		)
	}
}
