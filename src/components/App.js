import React, { Component } from 'react'
import Board from './Board'
import Welcome from './Welcome'
import axios from 'axios'
import '../assets/style/reset.css'
import '../assets/style/App.css'

export default class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			gameType: 'solo',
			gid: '',
			fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			dark: 'dark',
			light: 'light',
			bg: 'bg',
			welcome: true,
			gameover: false,
			musicPlay: true,
			soundOn: true,
			rotation: 'wht'
		}
	}

	rotateBoard = () => {
		this.state.rot === 'wht'
			? this.setState({ rot: 'blk' })
			: this.setState({ rot: 'wht' })
	}

	start = () => {
		if (this.state.gameType === 'solo') {
			const postBody = { fen: this.state.fen }
			axios
				.post('/api/game/new/solo', postBody)
				.then(res =>
					this.setState({
						gid: res.data.gid,
						fen: res.data.fen
					})
				).catch(err => console.log(err))
		}
	}

	render() {
		const { gameType, gid, fen, dark, light, rotation } = this.state
		return (
			<div className='App flex center col'>
				{gid ? (
					<Board
						gameType={gameType}
						gid={gid}
						rot={rotation}
						fen={fen}
						dark={dark}
						light={light}
					/>
				) : (
					<Welcome start={this.start} />
				)}
			</div>
		)
	}
}
