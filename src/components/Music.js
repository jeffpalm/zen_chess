import React, { Component } from 'react'

export default class Music extends Component {
	constructor() {
		super()
		this.state = {
			audioCtx: new AudioContext()
			
		}
		this.state.gainNode = this.state.audioCtx.createGain()
		this.state.filterNode = this.state.audioCtx.createBiquadFilter()
		this.state.filterNode.type = 'lowpass'
		this.state.gainNode.gain.value = 0.1
		
	}

	componentDidUpdate() {
		const { filterNode, audioCtx, audioPlayer, gainNode } = this.state

		if (this.props.preMove) {
			filterNode.frequency.exponentialRampToValueAtTime(
				200,
				audioCtx.currentTime + .5
			)
		} else if (!this.props.preMove){
			filterNode.frequency.exponentialRampToValueAtTime(
				5000,
				audioCtx.currentTime + .5
			)
        }
        
		if (this.props.musicPlay) {
			audioPlayer.play()
		} else if (!this.props.musicPlay) {
			audioPlayer.pause()
        }
        
        if (this.props.soundOn) {
            // audioPlayer.unmute()
        } else if (!this.props.musicPlay) {
            gainNode.gain.value = -1
        }
        
	}
	componentDidMount() {
        const audioPlayer = document.querySelector('#audio-player')
        console.log(audioPlayer.prototype)
        this.setState({audioPlayer})
        const { audioCtx, gainNode, filterNode } = this.state
        const track = audioCtx.createMediaElementSource(audioPlayer)
		track.connect(gainNode).connect(filterNode).connect(audioCtx.destination)
    }
	render() {
		
		return (
			<div>
				<audio id='audio-player' src='assets/music/Lo-fi-beats.ogg'></audio>
				{/* <input type="range" id="volume" min="-1" max="2" value={this.state.gain} step="0.01" onChange={this.setGain}></input>
                <input type="range" id="freq" min="0" max="20000" value={this.state.freq} step="0.01" onChange={this.setFreq}></input> */}
			</div>
		)
	}
}
