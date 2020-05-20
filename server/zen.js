// Chess board object to keep track of current game
// ID matches up to cb array coordinates
const board = require('./data/chess_board.json')
// Object containing direction conversion for move determination
const dir = require('./data/directions.json')
// Reference to order in which Front end chess board is rendered
const drawOrder = require('./data/board_draw_order.json')
// Array representing chess board to convert coordinates to square names and vice versa
const cb = require('./data/chess_board_array.json')

class ZenChess {
	constructor(fen) {
		this.fen = fen
		// External Guides for reference
		this.dir = JSON.parse(JSON.stringify(dir))
		this.boardDrawOrder = JSON.parse(JSON.stringify(drawOrder))
		this.cbIndex = JSON.parse(JSON.stringify(cb))
		this.board = JSON.parse(JSON.stringify(board))
		// Props used to construct FEN
		this.pieces = ''
		this.sideToMove = ''
		this.castlingAbility = ''
		this.enPassantTarget = ''
		this.halfMoveClock = ''
		this.fullMoveCount = ''
		// List of Current Valid Moves for sideToMove
		this.cvm = []
		// List of Previous Valid Moves for opposite side to use in kingMove logic
		this.pvm = []
		// Captured pieces
		this.captures = []
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
		this.cvm = this.curValidMoves()

		if (this.sideToMove === 'w') {
			this.sideToMove = 'b'
			this.pvm = this.curValidMoves()
			this.sideToMove = 'w'
		} else {
			this.sideToMove = 'w'
			this.pvm = this.curValidMoves()
			this.sideToMove = 'b'
		}
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
				output.push({ newSq: e, type: 'atk', origin: square })
			} else if (counter === 0) {
				output.push({ newSq: e, type: 'move', origin: square })
			}
		})
		return output

		// If diagnoal
	}

	// Returns an array of objects representing valid knight moves
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
			const index = this.board.findIndex(f => e === f.square)
			const { occupiedBy, curPiece } = this.board[index]
			if (occupiedBy === this.sideToMove) {
				return
			} else if (curPiece) {
				output.push({ newSq: e, type: 'atk', origin: this.coordConv(xS, yS) })
			} else {
				output.push({ newSq: e, type: 'move', origin: this.coordConv(xS, yS) })
			}
		})

		return output
	}

	// Returns an array of objects representing valid pawn moves
	pawnMoves = (xS, yS, color) => {
		const output = []
		const ept = this.enPassantTarget
		const origin = this.coordConv(xS, yS)
		switch (color) {
			case 'w':
				//#region WHITE PAWN MOVES
				const wMOneName = this.coordConv(xS, yS + 1)
				const wMOnePiece = this.getPiece(wMOneName)
				if (yS + 1 < 7) {
					if (!wMOnePiece) {
						// If curPiece is BLANK
						output.push({ newSq: wMOneName, type: 'move', origin })
						if (yS === 1) {
							// If Pawn still on starting rank
							const wMTwoName = this.coordConv(xS, yS + 2)
							const wMTwoPiece = this.getPiece(wMTwoName)
							if (!wMTwoPiece) {
								output.push({ newSq: wMTwoName, type: 'move', origin })
							}
						}
					}
				} else if (yS + 1 === 7 && !wMOnePiece) {
					output.push({ newSq: wMOneName, type: 'promo', origin })
				}

				// Pawn Attack Moves
				const wAOneName = this.coordConv(xS + 1, yS + 1)
				const wAOnePiece = this.getPiece(wAOneName)
				const wATwoName = this.coordConv(xS - 1, yS + 1)
				const wATwoPiece = this.getPiece(wATwoName)
				// Check if piece is occupying attack square 1
				if (wAOnePiece) {
					// Check if piece is black
					if (wAOnePiece === wAOnePiece.toLowerCase()) {
						output.push({
							newSq: wAOneName,
							// Check if attack is promo square
							type: yS + 1 === 7 ? 'atk promo' : 'atk',
							origin
						})
					}
				}
				// Check if piece is occupying attack square 2
				if (wATwoPiece) {
					// Check if piece is black
					if (wATwoPiece === wAOnePiece.toLowerCase()) {
						output.push({
							newSq: wATwoName,
							// Check if attack is promo square
							type: yS + 1 === 7 ? 'atk promo' : 'atk',
							origin
						})
					}
				}
				// Checks en Passant target
				if (wAOneName === ept || wATwoName === ept) {
					output.push({ newSq: ept, type: 'atk', origin })
				}
				//#endregion
				break

			case 'b':
				//#region BLACK PAWN MOVES
				const bMOneName = this.coordConv(xS, yS - 1)
				const bMOnePiece = this.getPiece(bMOneName)
				if (yS - 1 >= 0) {
					if (!bMOnePiece) {
						// If curPiece is BLANK
						output.push({ newSq: bMOneName, type: 'move', origin })
						if (yS === 6) {
							// If Pawn still on starting rank
							const bMTwoName = this.coordConv(xS, yS - 2)
							const bMTwoPiece = this.getPiece(bMTwoName)
							if (!bMTwoPiece) {
								output.push({ newSq: bMTwoName, type: 'move', origin })
							}
						}
					}
				} else if (yS - 1 === 0 && !bMOnePiece) {
					output.push({ newSq: bMOneName, type: 'promo', origin })
				}

				// Pawn Attack Moves
				const bAOneName = this.coordConv(xS + 1, yS - 1)
				const bAOnePiece = this.getPiece(bAOneName)
				const bATwoName = this.coordConv(xS - 1, yS - 1)
				const bATwoPiece = this.getPiece(bATwoName)
				// Check if piece is occupying attack square 1
				if (bAOnePiece) {
					// Check if piece is white
					if (bAOnePiece === bAOnePiece.toUpperCase()) {
						output.push({
							newSq: bAOneName,
							// Check if attack is promo square
							type: yS - 1 === 0 ? 'atk promo' : 'atk',
							origin
						})
					}
				}
				// Check if piece is occupying attack square 2
				if (bATwoPiece) {
					// Check if piece is black
					if (bATwoPiece === bATwoPiece.toUpperCase()) {
						output.push({
							newSq: bATwoName,
							// Check if attack is promo square
							type: yS - 1 === 0 ? 'atk promo' : 'atk',
							origin
						})
					}
				}
				// Checks en Passant target
				if (bAOneName === ept || bATwoName === ept) {
					output.push({ newSq: ept, type: 'atk', origin })
				}
				//#endregion
				break
		}
		return output
	}

	// Returns an array of objects representing valid moves from a particular space
	// Dependancies: coordConv, sqCoord, getPiece, oneDirection, knightMoves, pawnMoves
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
				arr.push(this.knightMoves(xS, yS))
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
				// filter out illegal king moves
				arr = arr.filter(e => this.pvm.findIndex(f => f.square === e.newSq) === -1)

				// handle castling
				// White Kingside index
				const wKs = this.castlingAbility.indexOf('K')
				// White Queenside index
				const wQs = this.castlingAbility.indexOf('Q')
				// Black Kingside index
				const bKs = this.castlingAbility.indexOf('k')
				// Black Queenside index
				const bQs = this.castlingAbility.indexOf('q')

				if (wKs !== -1 && !this.board[40].curPiece && !this.board[48].curPiece) {
					arr.push({newSq: 'g1', type: 'move castle', origin: 'e1', castle: 'f1'})
				}
				if (wQs !== -1 && !this.board[24].curPiece && !this.board[16].curPiece && !this.board[8].curPiece) {
					arr.push({newSq: 'c1', type: 'move castle', origin: 'e1', castle: 'd1'})
				}
				
				if (bKs !== -1 && !this.board[47].curPiece && !this.board[55].curPiece) {
					arr.push({newSq: 'g8', type: 'move castle', origin: 'e8', castle: 'f8'})
				}
				if (bQs !== -1 && !this.board[31].curPiece && !this.board[23].curPiece && !this.board[15].curPiece) {
					arr.push({newSq: 'c8', type: 'move castle', origin: 'e8', castle: 'd8'})
				}
				//#endregion
				break

			case 'P':
				//#region White Pawn Moves
				arr.push(this.pawnMoves(xS, yS, 'w'))

				//#endregion
				break

			case 'p':
				//#region Black Pawn Moves
				arr.push(this.pawnMoves(xS, yS, 'b'))
				//#endregion
				break
		}

		return arr.flat()
	}

	// Returns an array of objects representing all valid moves for the position
	curValidMoves = () => {
		// filter only squares occupied by sideToMove pieces
		// map over filtered array to return a list of square names to feed into valid moves
		// flatten map
		// filter out any blanks
		return this.board
			.filter(e => e.occupiedBy === this.sideToMove)
			.map(f => this.validMoves(f.square))
			.flat()
			.filter(g => g !== '')
	}

	// Takes current props and converts to FEN
	fenEncoder = () => {
		let output
		let blankCount = 0
		output = this.pieces.reduce((acc, cur, i) => {
			if (cur) {
				if ((i + 1) % 8 === 0) {
					if (blankCount === 0) {
						return `${acc}${cur}/`
					} else {
						acc = `${acc}${blankCount}${cur}/`
						blankCount = 0
						return acc
					}
				} else {
					if (blankCount === 0) {
						return acc + cur
					} else {
						acc = `${acc}${blankCount}${cur}`
						blankCount = 0
						return acc
					}
				}
			} else {
				if ((i + 1) % 8 === 0) {
					acc = `${acc}${++blankCount}/`
					blankCount = 0
					return acc
				} else {
					blankCount++
					return acc
				}
			}
		}, '')
		output = output.substring(0, output.length - 1)
		output = `${output} ${this.sideToMove} ${this.castlingAbility} ${this.enPassantTarget} ${this.halfMoveClock} ${this.fullMoveCount}`
		return output
	}

	// Moves in pure coordinate notation
	// <from square><to square>[<promoted to>]
	move = move => {
		// From square
		const fS = move.substring(0, 2)
		// From square piece
		const fSP = this.getPiece(fS)
		// From square index in board array
		const fSI = this.board.findIndex(e => e.square === fS)
		// To square
		const tS = move.substring(2, 4)
		// To square Piece
		const tSP = this.getPiece(tS)
		// To square index
		const tSI = this.board.findIndex(e => e.square === tS)

		this.board[fSI].prePiece = fSP
		this.board[fSI].curPiece = ''
		this.board[fSI].occupiedBy = ''
		this.board[tSI].prePiece = tSP
		this.board[tSI].curPiece = fSP
		this.board[tSI].occupiedBy = this.sideToMove
		this.board[tSI].cPMoveCount = +this.board[fSI].cPMoveCount + 1
		
		if (tSP) this.captures.push(tSP)

		this.pvm = this.curValidMoves()
		
		this.pieces = this.boardDrawOrder.map(e => this.getPiece(e))

		if (this.sideToMove === 'w') {
			this.sideToMove = 'b'
		} else {
			this.sideToMove = 'w'
			this.fullMoveCount++
		}

		this.cvm = this.curValidMoves()

		// Handle castling
		// White
		let castling
		// 0 = Queen side, 56 = King side, 32 = King starting square
		const wCastlingIndicies = [0, 32, 56]
		const wKingStart = this.board[32]
		const wKingSideRook = this.board[56]
		const wQueenSideRook = this.board[0]
		

		// Black
		//
		const bCastlingIndicies = [7, 39, 63]
		const bKingStart = this.board[39]
		const bKingSideRook = this.board[63]
		const bQueenSideRook = this.board[7]
		
		// Handle promotion

		// Handle en Passant

		// Handle halfMoveClock

		// Handle fullMoveCount
		
	}

	/*  To-do
			- Further testing on curValidMoves method
				+ Test if king moves are valid
				+ Debug
				+ Add castling
			- move(square) method
				+ origin prePiece = curPiece
				+ origin curPiece = ''
				+ newSq prePiece = curPiece
				+ newSq curPiece = origin curPiece
				+ run curValidMoves() save to prevValidMoves prop
				+ THEN change sideToMove()
				+ run curValidMoves() save to currentValidMoves prop
				+ Update props:
					- pieces X
					- sideToMove X
					- castlingAbility 
					- enPassantTarget
					- halfMoveClock
					- fullMoveCount X
				+ call fenEncoder() to update this.fen
			- update api calls in app to new server port
			- wire up front-end
	*/
}

// const game = new ZenChess('8/4B3/2K3p1/1P3p2/5P2/8/3k4/5b2 b - - 7 44')
const game = new ZenChess('rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6')
// const game = new ZenChess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
// const game = new ZemChess('r3k1r1/ppR2p2/4p3/1p2P3/3P2p1/6Q1/P2q2P1/2R3K1 w q - 1 2')

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

// console.log(game.curValidMoves())
console.log(game.fenEncoder())
console.log(game.board[39])

// module.exports = ZenChess
