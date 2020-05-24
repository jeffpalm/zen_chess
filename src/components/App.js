import React, { Component } from 'react'
import Board from './Board'
import Welcome from './Welcome'
import GameOver from './GameOver'
import axios from 'axios'
import '../assets/style/reset.css'
import '../assets/style/App.css'

export default class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			gameType: 'solo',
			gid: '',
			startFEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			dark: 'dark',
			light: 'light',
			bg: 'bg',
			welcome: true,
			gameover: false,
			musicPlay: true,
			soundOn: true,
			rotation: 'rotW',
			preMove: false,
			outcome: ''
		}
	}

	updateOutcome = outcome => {
		this.setState({ outcome })
	}

	rotateBoard = () => {
		this.state.rotation === 'rotW'
			? this.setState({ rotation: 'rotB' })
			: this.setState({ rotation: 'rotW' })
	}

	start = () => {
		this.setState({ welcome: false })
		if (this.state.gameType === 'solo') {
			const postBody = { fen: this.state.startFEN }
			axios
				.post('/api/game/new/solo', postBody)
				.then(res =>
					setTimeout(() => {
						this.setState({
							gid: res.data.gid
						})
					}, 500)
				)
				.catch(err => console.log(err))
		}
	}

	finish = gid => {
		axios
			.delete(`/api/game/${gid}`)
			.then(() => {
				console.log(`${gid} deleted`)
			})
			.catch(err => {
				console.log(err)
			})
	}

	newGame = () => {
		if (this.state.gameType === 'solo') {
			this.finish(this.state.gid)
			const postBody = { fen: this.state.startFEN }
			axios
				.post('/api/game/new/solo', postBody)
				.then(res =>
					setTimeout(() => {
						this.setState({
							gid: res.data.gid
						})
					}, 500)
				)
				.catch(err => console.log(err))
		}
	}

	render() {
		const {
			gameType,
			gid,
			dark,
			light,
			rotation,
			welcome,
			outcome
		} = this.state
		return (
			<div className='App flex center col'>
				{outcome === 'mate' ? (
					<GameOver outcome={outcome} newGame={this.newGame} finish={this.finish} />
				) : null}
				{gid ? (
					<Board
						gameType={gameType}
						gid={gid}
						rotation={rotation}
						rotateBoard={this.rotateBoard}
						dark={dark}
						light={light}
						updateOutcome={this.updateOutcome}
					/>
				) : (
					<Welcome start={this.start} vis={welcome} />
				)}
			</div>
		)
	}
}
