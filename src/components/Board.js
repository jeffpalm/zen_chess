import React, { Component } from 'react'
import Square from './Square'
import Files from './Files'
import Ranks from './Ranks'

export default class Board extends Component {
	constructor(props) {
		super(props)

		this.state = {
			rank: [8, 7, 6, 5, 4, 3, 2, 1],
			file: ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'],
			dark: 'dark',
			light: 'light',
		}
	}

	// Returns an array with length of 64 with pieces on the board of a current position
	// This array matches up with the drawBoard() array.

	fenParser() {
		let output = []
		const { fen } = this.props
		const pieces = fen.substring(0, fen.indexOf(' '))
		pieces.split('').map((e, i) => {
			if (parseInt(e)) {
				for (let j = 0; j < parseInt(e); j++) {
					output.push('')
				}
			} else if (e !== '/') {
				output.push(e)
			}
		})
		return output
	}

	// Iterates through the rank and file arrays in state to draw the board in a way
	// that matches up to FEN notation

	drawBoard() {
		let output = []
		let sqCount = 0
		const pieces = this.fenParser()
		const { rank, file, dark, light } = this.state
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				let iE = i % 2 === 0 // i is even = true | odd = false
				let jE = j % 2 === 0 // j is even = true | odd = false
				output.push(
					<Square
						rot={this.props.rot}
						piece={pieces[sqCount++]}
						key={file[j] + rank[i]}
						file={file[j]}
						rank={rank[i]}
						color={(iE && jE) || (!iE && !jE) ? dark : light}
					/>
				)
			}
		}
		return output
	}
	
	render() {
		const { rot } = this.props
		return (
			<div className={'flex Ranks ' + rot}>
				<Ranks />
				<div className='Board flex'>
					{this.drawBoard()}
					<Files fileNames={this.state.file} />
				</div>
			</div>
		)
	}
}
