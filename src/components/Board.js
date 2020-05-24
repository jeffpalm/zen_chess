import React, { Component } from 'react'
import axios from 'axios'
import Square from './Square'
import stBoard from '../assets/data/starting_chess_board.json'

export default class Board extends Component {
	constructor(props) {
		super(props)

		this.state = {
			fen: '',
			board: JSON.parse(JSON.stringify(stBoard)),
			moves: [], // Record of moves made in current game
			cvm: [], // Current Valid moves
			sideToMove: '', // Side to move
			outcome: '', // For game outcome. if blank, game is still ongoing
			preMove: false,
			mounted: false,
			selectedSquare: '',
			ssMoves: []
		}
	}

	preMoveToggle = e => {
		const { preMove: pm, selectedSquare: ss, cvm } = this.state
		this.setState({
			preMove: !pm,
			selectedSquare: ss ? '' : e.target.id,
			ssMoves: ss ? [] : cvm.filter(e => e.from === ss)
		})
	}

	makeMove = e => {
		const from = this.state.selectedSquare
		const moveIndex = this.state.cvm.findIndex(
			mv => mv.from === from && mv.to === e.target.id
		)
		const move = { move: this.state.cvm[moveIndex] }
		axios
			.put(`/api/game/move/${this.props.gid}`, move)
			.then(res => {
				const {
					fen,
					board,
					moves,
					captures,
					sideToMove,
					cvm,
					outcome
				} = res.data
				this.setState({
					fen,
					board,
					moves,
					captures,
					sideToMove,
					cvm,
					outcome,
					preMove: false,
					selectedSquare: ''
				})
				this.props.rotateBoard()
			})
			.catch(err => console.table(err))
	}
	componentDidUpdate() {
		// console.log(this.state)
	}
	componentDidMount() {
		axios
			.get(`/api/game/${this.props.gid}`)
			.then(res => {
				const {
					fen,
					board,
					pieces,
					moves,
					captures,
					sideToMove,
					cvm,
					outcome
				} = res.data
				this.setState({
					fen,
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
		// console.table(imgs)
		// console.log(this.state)
		const { rotation, dark, light } = this.props
		const { preMove, board, cvm, selectedSquare: ss, ssMoves } = this.state
		return (
			<div className={'Board flex ' + rotation}>
				{!this.state.mounted
					? ''
					: board.map(sq => {
							let validToSquare = cvm.some(
								e => e.from === ss && e.to === sq.square
							)
							let validFromSquare = cvm.some(e => e.from === sq.square)
							return (
								<Square
									key={sq.square}
									action={
										sq.cvm.length && !preMove
											? this.preMoveToggle
											: preMove && validToSquare
											? this.makeMove
											: validFromSquare
											? this.preMoveToggle
											: null
									}
									rotation={rotation}
									piece={sq.cP}
									color={sq.color === 'light' ? light : dark}
									square={sq.square}
									marker={rotation === 'rotW' ? sq.rotW : sq.rotB}
									pms={
										preMove && validToSquare
											? 'move'
											: ss === sq.square
											? 'selected'
											: validFromSquare
											? ''
											: 'invalid'
									} // Pre-move style
								/>
							)
					  })}
			</div>
		)
	}
}
