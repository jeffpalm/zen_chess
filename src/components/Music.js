import React, { Component } from 'react';
import { AudioContext } from 'standardized-audio-context';

export default class Music extends Component {
	constructor() {
		super();
		this.state = {
			audioCtx: new AudioContext(),
		};
		this.state.gainNode = this.state.audioCtx.createGain();
		this.state.filterNode = this.state.audioCtx.createBiquadFilter();
		this.state.analyserNode = this.state.audioCtx.createAnalyser();
		this.state.filterNode.type = 'lowpass';
		this.state.gainNode.gain.value = 0.1;
	}

	componentDidUpdate() {
		const { filterNode, audioCtx, audioPlayer, analyserNode } = this.state;

		if (audioCtx.state === 'suspended') {
			audioCtx.resume();
		}

		if (this.props.preMove) {
			filterNode.frequency.exponentialRampToValueAtTime(
				200,
				audioCtx.currentTime + 0.5
			);
		} else if (!this.props.preMove) {
			filterNode.frequency.exponentialRampToValueAtTime(
				5000,
				audioCtx.currentTime + 0.2
			);
		}

		if (this.props.musicPlay) {
			audioPlayer.play();
		} else if (!this.props.musicPlay) {
			audioPlayer.pause();
		}

		if (this.props.soundOn) {
			audioPlayer.muted = false;
		} else if (!this.props.soundOn) {
			audioPlayer.muted = true;
		}
		setInterval(() => {
			let freqArray = new Float32Array(analyserNode.frequencyBinCount);
			const chessBoard = document.querySelector('#chess-board');
			if (this.props.musicPlay && chessBoard) {
				void analyserNode.getFloatFrequencyData(freqArray);
				// console.log(freqArray)
				let output = freqArray.reduce((acc, cur) => -1 / (acc + cur), 0);
				output *= 10000;
				output -= 40;
				output = Math.floor(output * 5);
				// console.log(output)
				chessBoard.style.boxShadow = `0px 0px ${output}px 0px white`;
			} else if (!this.props.musicPlay && chessBoard) {
				chessBoard.style.boxShadow = `0px 0px 10px 0px white`;
			}
		}, 17);
	}
	componentDidMount() {
		const audioPlayer = document.querySelector('#audio-player');

		audioPlayer.loop = true;
		audioPlayer.currentTime = Math.ceil(Math.random() * 3000);
		// console.log(audioPlayer.prototype)
		this.setState({ audioPlayer });
		const { audioCtx, gainNode, filterNode, analyserNode } = this.state;
		const track = audioCtx.createMediaElementSource(audioPlayer);
		track
			.connect(gainNode)
			.connect(filterNode)
			.connect(analyserNode)
			.connect(audioCtx.destination);
	}
	render() {
		return (
			<div>
				<audio
					id='audio-player'
					src='assets/music/Lo-fi-beats.ogg'
					autoPlay
				></audio>
			</div>
		);
	}
}
