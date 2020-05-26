import React, { Component } from 'react'
import Board from './Board'
import Welcome from './Welcome'
import GameOver from './GameOver'
import axios from 'axios'
import { Icon } from '@iconify/react'
import refreshIcon from '@iconify/icons-mdi-light/refresh'
import volumeIcon from '@iconify/icons-mdi-light/volume'
import volumeOff from '@iconify/icons-mdi-light/volume-off'
import flagIcon from '@iconify/icons-mdi-light/flag'
import playIcon from '@iconify/icons-mdi-light/play'
import pauseIcon from '@iconify/icons-mdi-light/pause'
import Music from './Music'
import '../assets/style/reset.css'
import '../assets/style/App.css'
// import socketIOClient from 'socket.io-client'
// const ENDPOINT = 'http://localhost:9342'
// const socket = socketIOClient(ENDPOINT)

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
			musicPlay: false,
			soundOn: true,
			rotation: 'rotW',
			preMove: false,
			status: '',
			outcome: '',
			mpSide: '',
			sideToMove: ''
		}
	}
	//#region Methods
	gameOverToggle = () => {
		this.setState({ gameover: !this.state.gameover })
	}

	updateStatus = (status, outcome, sideToMove) => {
		this.setState({ status, outcome, sideToMove })
	}

	daddyPreMoveToggle = () => {
		this.setState({ preMove: !this.state.preMove })
	}

	musicToggle = () => {
		this.setState({ musicPlay: !this.state.musicPlay })
	}

	soundToggle = () => {
		this.setState({ soundOn: !this.state.soundOn })
	}

	surrender = () => {
		const { sideToMove } = this.state
		let outcome
		sideToMove === 'w' ? (outcome = '0-1') : (outcome = '1-0')

		this.setState({ status: 'resign', outcome })
		this.gameOverToggle()
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
			this.setState({ gameover: false })
			const postBody = { fen: this.state.startFEN }
			axios
				.post('/api/game/new/solo', postBody)
				.then(res =>
					setTimeout(() => {
						this.setState({
							gid: res.data.gid,
							status: '',
							rotation: 'rotW'
						})
					}, 500)
				)
				.catch(err => console.log(err))
		}
	}

	// multiplayer = () => {
	// 	socket.emit('new-mp-game')
	// 	socket.on('new-game', data => {
	// 		console.log(data)
	// 	})
	// }
	
	componentDidMount() {}

	render() {
		const {
			gameType,
			gid,
			dark,
			light,
			rotation,
			welcome,
			status,
			outcome,
			gameover,
			musicPlay,
			soundOn,
			preMove
		} = this.state

		return (
			<div className='App flex center col'>
				<Music preMove={preMove} musicPlay={musicPlay} soundOn={soundOn} />

				{gameover ? (
					<GameOver
						status={status}
						outcome={outcome}
						newGame={this.newGame}
						vis={gameover}
					/>
				) : null}
				{gid ? (
					<div>
						<div className='new-game-trans'></div>
						<Board
							gameType={gameType}
							gid={gid}
							rotation={rotation}
							rotateBoard={this.rotateBoard}
							dark={dark}
							light={light}
							gameOverToggle={this.gameOverToggle}
							updateStatus={this.updateStatus}
							status={status}
							daddyPNToggle={this.daddyPreMoveToggle}
						/>
					</div>
				) : (
					<Welcome vis={welcome} start={this.start} />
				)}
				<div className='ctrl-cont'>
					{welcome ? null : (
						<Icon
							className='ctrl-btn'
							icon={refreshIcon}
							style={{ color: '#fff', fontSize: '65px' }}
							onClick={this.rotateBoard}
						/>
					)}
					{soundOn ? (
						<Icon
							className='ctrl-btn-off'
							icon={volumeIcon}
							style={{ color: '#fff', fontSize: '65px' }}
							onClick={this.soundToggle}
						/>
					) : (
						<Icon
							className='ctrl-btn-on'
							icon={volumeOff}
							style={{ color: '#fff', fontSize: '65px' }}
							onClick={this.soundToggle}
						/>
					)}
					{musicPlay ? (
						<Icon
							className='ctrl-btn-off'
							icon={pauseIcon}
							style={{ color: '#fff', fontSize: '65px' }}
							onClick={this.musicToggle}
						/>
					) : (
						<Icon
							className='ctrl-btn-on'
							icon={playIcon}
							style={{ color: '#fff', fontSize: '65px' }}
							onClick={this.musicToggle}
						/>
					)}
					{welcome ? null : (
						<Icon
							className='ctrl-btn'
							icon={flagIcon}
							style={{ color: '#fff', fontSize: '65px' }}
							onClick={this.surrender}
						/>
					)}
				</div>
			</div>
		)
	}
}
