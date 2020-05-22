import React, { Component } from 'react'
import axios from 'axios'
import Square from './Square'
import stBoard from '../assets/data/starting_chess_board.json'
import drawOrder from '../assets/data/board_draw_order.json'

export default class Board extends Component {
	constructor(props) {
		super(props)

		this.state = {
			drawOrder: JSON.parse(JSON.stringify(drawOrder)),
			board: JSON.parse(JSON.stringify(stBoard)),
			pieces: [], // Array of pieces that lines up with drawOrder
			moves: [], // Record of moves made in current game
			cvm: [], // Current Valid move
			sideToMove: '', // Side to move
			outcome: '', // For game outcome. if blank, game is still ongoing
			preMove: false,
			mounted: false,
			selectedSquare: '',
			ssMoves: []
		}
	}

	drawBoard = () => {
		if (!this.state.mounted) return <span>Loading</span>

		let output = []

		const {
			drawOrder,
			preMove,
			board,
			pieces,
			cvm,
			selectedSquare: ss,
			ssMoves
		} = this.state

		for (let i = 0; i < drawOrder.length; i++) {
			const sqI = board.findIndex(e => e.square === drawOrder[i])
			const sqName = board[sqI].square
			const fromIndex = cvm.findIndex(e => e.from === sqName)

			// set type to invalid
			// check cvm for origin
			// if it doesn't exist, set invalid
			let type
			if (preMove) {
				
			} else {
				if (fromIndex === -1) type = 'invalid'
			}

			output.push(
				<Square
					preMove={this.squareClick}
					type={type}
					rot={this.props.rot}
					piece={pieces[i]}
					key={sqName}
					color={board[sqI].color}
					square={sqName}
				/>
			)
		}

		return output
	}

	squareClick = e => {
		const { preMove: pm, selectedSquare: ss, cvm } = this.state
		this.setState({
			preMove: !pm,
			selectedSquare: ss ? '' : e.target.id,
			ssMoves: ss ? [] : cvm.filter(e => e.from === ss)
		})
	}

	makeMove = e => {}

	componentDidMount() {
		axios
			.get(`/api/game/${this.props.gid}`)
			.then(res => {
				const {
					board,
					pieces,
					moves,
					captures,
					sideToMove,
					cvm,
					outcome
				} = res.data
				this.setState({
					board,
					pieces,
					moves,
					captures,
					sideToMove,
					cvm,
					outcome,
					mounted: true
				})
			})
			.catch(err => console.log(err))
	}

	render() {
		console.log(this.state)
		const { rot } = this.props
		return (
			<div className={'flex Ranks ' + rot}>
				<div className='Board flex'>
					{this.state.mounted ? this.drawBoard() : ''}
				</div>
			</div>
		)
	}
}
