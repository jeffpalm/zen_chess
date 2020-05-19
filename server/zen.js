const board = require('./data/chess_board.json')
const dir = require('./data/directions.json')

class ZenChess {
	constructor(fen) {
		this.fen = fen
		this.dir = JSON.parse(JSON.stringify(dir))
		this.board = JSON.parse(JSON.stringify(board))
		this.pieces = ''
		this.sideToMove = ''
		this.castlingAbility = ''
		this.enPassantTarget = ''
		this.halfMoveClock = ''
		this.fullMoveCount = ''
		this.boardDrawOrder = [
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
		]
		this.cbIndex = [
			['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'],
			['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'],
			['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'],
			['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'],
			['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
			['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'],
			['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'],
			['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8']
		]
	}
	// Initializes game and populates property values based on FEN
	init = () => {
		// Converting FEN to 1 dimension array matching board
		const parsingPieces = this.fen.substring(0, this.fen.indexOf(' '))
		const parsedPieces = []
		parsingPieces.split('').map((e, i) => {
			if (parseInt(e)) {
				for (let j = 0; j < parseInt(e); j++) {
					parsedPieces.push('')
				}
			} else if (e !== '/') {
				parsedPieces.push(e)
			}
		})

		this.pieces = parsedPieces
		this.pieces.map((e, i) => {
			const sq = this.boardDrawOrder[i]
			const index = this.board.findIndex(j => j.square === sq)
			this.board[index].prePiece = this.board[index].curPiece
			this.board[index].curPiece = e
			if (e && e !== e.toLowerCase()) {
				this.board[index].occupiedBy = 'w'
			} else if (e) {
				this.board[index].occupiedBy = 'b'
			}
		})

		// extracting remaining FEN information
		const whitespaces = this.fen.matchAll(/\s/g)
		const wi = [] // Whitespace Indicies
		for (let space of whitespaces) {
			wi.push(space.index)
		}

		this.sideToMove = this.fen.substring(wi[0] + 1, wi[1])
		this.castlingAbility = this.fen.substring(wi[1] + 1, wi[2])
		this.enPassantTarget = this.fen.substring(wi[2] + 1, wi[3])
		this.halfMoveClock = this.fen.substring(wi[3] + 1, wi[4])
		this.fullMoveCount = this.fen.substring(wi[4] + 1, this.fen.length)
	}
	// Converts starting square and offset coordinates into square name
	coordConv = (x, y) => {
		const search = `${x}${y}`
		if (x < 0 || x > 7 || y < 0 || y > 7) return false
		return this.board.find(e => e.id === search).square
	}
	// Converts square name to x/y coordinates
	sqCoord = square => {
		return this.board.find(e => e.square === square).id
	}
	// Returns name of piece at square
	getPiece = square => {
		const index = this.board.findIndex(e => e.square === square)
		if (index === -1) return false
		return this.board[index].curPiece
	}
	// Max is optional param that is number of squares distance
	oneDirection = (square, direction, max) => {
		const sqCoords = this.sqCoord(square)
			.split('')
			.map(e => +e)
		const { 0: xS, 1: yS } = sqCoords
		const dirIncrements = this.dir[direction]
		const { 0: xInc, 1: yInc } = dirIncrements

		const offsets = []
		for (let x = xS + xInc; x < 8 && x >= 0; xInc < 0 ? x-- : x++) {
			for (let y = yS + yInc; y < 8 && y >= 0; yInc < 0 ? y-- : y++) {
				if (Math.abs(xInc) === Math.abs(yInc)) {
					if (Math.abs(x - xS) === Math.abs(y - yS)) {
						if (max) {
							if (Math.abs(x - xS) <= max) {
								offsets.push([x, y])
							}
						} else {
							offsets.push([x, y])
						}
					}
				} else {
					if (xInc === 0) {
						if (x === xS) {
							if (max) {
								if (Math.abs(y - yS) <= max) {
									offsets.push([x, y])
								}
							} else {
								offsets.push([x, y])
							}
						}
					} else {
						if (y === yS) {
							if (max) {
								if (Math.abs(x - xS) <= max) {
									offsets.push([x, y])
								}
							} else {
								offsets.push([x, y])
							}
						}
					}
				}
			}
		}

		const offsetsConv = offsets.map(e => this.coordConv(e[0], e[1]))

		let counter = 0
		const output = []
		offsetsConv.map(e => {
			const { occupiedBy, curPiece } = this.board.find(f => f.square === e)
			if (occupiedBy === this.sideToMove) {
				counter++
				return
			} else if (curPiece && counter === 0) {
				counter++
				output.push({ newSq: e, type: 'atk' })
			} else if (counter === 0) {
				output.push({ newSq: e, type: 'move' })
			}
		})
		return output

		// If diagnoal
	}

	knightMoves = (xS, yS) => {
		const moves = [
			[1, 2],
			[-1, 2],
			[-1, -2],
			[1, -2],
			[-2, 1],
			[-2, -1],
			[2, -1],
			[2, 1]
		]
		const movesConv = moves
			.map(e => {
				if (this.coordConv(e[0] + xS, e[1] + yS)) {
					return this.coordConv(e[0] + xS, e[1] + yS)
				}
			})
			.filter(e => e)
		const output = []

		movesConv.map(e => {
			const { occupiedBy, curPiece } = this.board.find(f => f.square === e)
			if (occupiedBy === this.sideToMove) {
				return
			} else if (curPiece) {
				output.push({ newSq: e, type: 'atk' })
			} else {
				output.push({ newSq: e, type: 'move' })
			}
		})

		return output
	}

	pawnMoves = (xS, yS, color) => {
		const output = []
		switch (color) {
			case 'w':
				// Possibility One
				const mOneName = this.coordConv(xS, yS + 1)
				const mOnePiece = this.getPiece(mOneName)
				if (yS + 1 < 7) {
					if (!mOnePiece){
						// If curPiece is BLANK
						output.push({ newSq: mOneName, type: 'move' })
						if (yS === 1) {
							// If Pawn still on starting rank
							const mTwoName = this.coordConv(xS, yS + 2)
							const mTwoPiece = this.getPiece(mTwoName)
							if (!mTwoPiece){
								output.push({ newSq: mTwoName, type: 'move'})
							}
						}
						
					}
				} else if (yS + 1 === 7){
					output.push({newSq: mOneName, type: 'promo'})
				}
				
		}
	}

	// Returns an array of objects representing valid moves from a particular space
	validMoves = square => {
		const sqCoords = this.sqCoord(square)
			.split('')
			.map(e => +e)
		const { 0: xS, 1: yS } = sqCoords
		let arr = []

		const piece = this.board.find(e => e.square === square).curPiece
		const od = this.oneDirection

		switch (piece) {
			case 'r':
			case 'R':
				//#region  Rook Moves
				arr.push(od(square, 'n'))
				arr.push(od(square, 's'))
				arr.push(od(square, 'e'))
				arr.push(od(square, 'w'))
				//#endregion
				break

			case 'n':
			case 'N':
				//#region Knight Moves
				arr.push(this.knightMoves(xS, xY))
				//#endregion
				break

			case 'b':
			case 'B':
				//#region Bishop Moves
				arr.push(od(square, 'nw'))
				arr.push(od(square, 'ne'))
				arr.push(od(square, 'sw'))
				arr.push(od(square, 'se'))
				//#endregion
				break

			case 'q':
			case 'Q':
				//#region Queen Moves
				for (let d in this.dir) {
					arr.push(od(square, d))
				}
				//#endregion
				break

			case 'k':
			case 'K':
				//#region King Moves
				for (let d in this.dir) {
					arr.push(od(square, d, 1))
				}
				//#endregion
				break

			case 'P':
				//#region White Pawn Moves
				yS === 1 ? arr.push(od(square, 'n', 2)) : arr.push(od(square, 'n', 1))

				arr = arr.filter(e => e.type !== 'move')

				const { newSq: a1 } = od(square, 'nw', 1)
				if (this.board.find(e => e.square === a1)) {
					const { occupiedBy: a1Occ, curPiece: a1p } = this.board.find(e => e.square === a1)
					if (a1Occ !== this.sideToMove) {
						if (this.enPassantTarget === a1) {
							arr.push({ newSq: a1, type: 'atk' })
						} else if (a1p) {
							arr.push({ newSq: a1, type: 'atk' })
						}
					}
				}

				const { newSq: a2 } = od(square, 'ne', 1)
				if (this.board.find(e => e.square === a2)) {
					const { occupiedBy: a2Occ, curPiece: a2p } = this.board.find(e => e.square === a2)

					if (a2Occ !== this.sideToMove) {
						if (this.enPassantTarget === a2) {
							arr.push({ newSq: a2, type: 'atk' })
						} else if (a2p) {
							arr.push({ newSq: a2, type: 'atk' })
						}
					}
				}

				//#endregion
				break

			case 'p':
				//#region Black Pawn Moves
				yS === 6 ? arr.push(od(square, 's', 2)) : arr.push(od(square, 's', 1))

				arr = arr.filter(e => e.type !== 'move')

				const { newSq: a3 } = od(square, 'sw', 1)
				if (this.board.find(e => e.square === a3)) {
					const { occupiedBy: a3Occ, curPiece: a3p } = this.board.find(e => e.square === a3)
					if (a3Occ !== this.sideToMove) {
						if (this.enPassantTarget === a3) {
							arr.push({ newSq: a3, type: 'atk' })
						} else if (a3p) {
							arr.push({ newSq: a3, type: 'atk' })
						}
					}
				}

				const { newSq: a4 } = od(square, 'se', 1)
				if (this.board.find(e => e.square === a4)) {
					const { occupiedBy: a4Occ, curPiece: a4p } = this.board.find(e => e.square === a4)

					if (a4Occ !== this.sideToMove) {
						if (this.enPassantTarget === a4) {
							arr.push({ newSq: a4, type: 'atk' })
						} else if (a4p) {
							arr.push({ newSq: a4, type: 'atk' })
						}
					}
				}
				//#endregion
				break
		}

		return arr.flat()
	}
}

// const game = new ChessGame('8/4B3/2K3p1/1P3p2/5P2/8/3k4/5b2 b - - 7 44')
const game = new ZenChess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
// const game = new ChessGame('r3k1r1/ppR2p2/4p3/1p2P3/3P2p1/6Q1/P2q2P1/2R3K1 w q - 1 2')

game.init()

// console.log('Pieces: ', game.pieces)
// console.log('SideToMove: ', game.sideToMove)
// console.log('Castling Ability: ', game.castlingAbility)
// console.log('EnPassant : ', game.enPassantTarget)
// console.log('HalfMoveClock: ', game.halfMoveClock)
// console.log( 'FullMoveCount: ', game.fullMoveCount )
// console.log(game.board.d2)
// console.log( game.validMoves( 'b1' ) )

// console.log(game.coordConv(2, 5))
// console.log('n', game.validMoves('e2'))

// console.log(
// 	game.board.filter(e => e.occupiedBy === game.sideToMove).map(f => game.validMoves(f.square))
// )

console.log(game.getPiece('g3'))

// module.exports = ZenChess
