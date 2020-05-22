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
		this.moves = []
		this.pieces = ''
		this.sideToMove = ''
		this.castlingAbility = `${this.K}${this.Q}${this.k}${this.q}`
		this.K = 'K'
		this.Q = 'Q'
		this.k = 'k'
		this.q = 'q'
		this.enPassantTarget = ''
		this.halfMoveClock = ''
		this.fullMoveCount = ''
		// List of Current Valid Moves for sideToMove
		this.cvm = []
		// List of Opposite side's valid Moves
		this.kingThreats = []
		// Captured pieces
		this.captures = []
		this.outcome = ''
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
			this.board[index].pP = this.board[index].cP
			this.board[index].cP = e
			if (e && e !== e.toLowerCase()) {
				this.board[index].side = 'w'
			} else if (e) {
				this.board[index].side = 'b'
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

		// Load PVM for king vulnerability testing
		// Opposite side to movc
		// this.kingThreats = this.kingCheck()

		// if (this.sideToMove === 'w') {
		// 	this.sideToMove = 'b'
		// 	this.pvm = this.curValidMoves()
		// 	this.sideToMove = 'w'
		// } else {
		// 	this.sideToMove = 'w'
		// 	this.pvm = this.curValidMoves()
		// 	this.sideToMove = 'b'
		// }
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
		return this.board[index].cP
	}
	// Max is optional param that is number of squares distance
	oneDirection = (square, direction, stm, max) => {
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
		if (!stm) stm = this.sideToMove
		let counter = 0
		const output = []
		offsetsConv.map(e => {
			const { side, cP } = this.board.find(f => f.square === e)
			if (side === stm) {
				counter++
				return
			} else if (cP && counter === 0) {
				counter++
				output.push({ newSq: e, type: 'atk', origin: square, atkP: cP })
			} else if (counter === 0) {
				output.push({ newSq: e, type: 'move', origin: square })
			}
		})
		return output
	}

	// Returns an array of objects representing valid knight moves
	knightMoves = (xS, yS, stm) => {
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

		if (!stm) stm = this.sideToMove

		movesConv.map(e => {
			const index = this.board.findIndex(f => e === f.square)
			const { side, cP } = this.board[index]
			if (side === stm) {
				return
			} else if (cP) {
				output.push({ newSq: e, type: 'atk', origin: this.coordConv(xS, yS) })
			} else {
				output.push({ newSq: e, type: 'move', origin: this.coordConv(xS, yS) })
			}
		})

		return output
	}

	// Returns an array of objects representing valid pawn moves
	pawnMoves = (xS, yS, stm) => {
		const output = []
		const ept = this.enPassantTarget
		const origin = this.coordConv(xS, yS)
		switch (stm) {
			case 'w':
				//#region WHITE PAWN MOVES
				const wMOneName = this.coordConv(xS, yS + 1)
				const wMOnePiece = this.getPiece(wMOneName)
				if (yS + 1 < 7) {
					if (!wMOnePiece) {
						// If cP is BLANK
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
					output.push({ newSq: wMOneName, type: 'promo', origin, promo: 'Q' })
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
							origin,
							promo: 'Q',
							atkP: wAOnePiece
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
							origin,
							promo: 'Q',
							atkP: wATwoPiece
						})
					}
				}
				// Checks en Passant target
				if (wAOneName === ept || wATwoName === ept) {
					output.push({ newSq: ept, type: 'atk', origin, atkP: this.getPiece(ept) })
				}
				//#endregion
				break

			case 'b':
				//#region BLACK PAWN MOVES
				const bMOneName = this.coordConv(xS, yS - 1)
				const bMOnePiece = this.getPiece(bMOneName)
				if (yS - 1 >= 0) {
					if (!bMOnePiece) {
						// If cP is BLANK
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
					output.push({ newSq: bMOneName, type: 'promo', origin, promo: 'q' })
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
							origin,
							promo: 'q',
							atkP: bAOnePiece
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
							origin,
							promo: 'q',
							atkP: bATwoPiece
						})
					}
				}
				// Checks en Passant target
				if (bAOneName === ept || bATwoName === ept) {
					output.push({ newSq: ept, type: 'atk', origin, promo: 'q', atkP: this.getPiece(ept) })
				}
				//#endregion
				break
		}
		return output
	}

	// Returns an array of objects representing valid moves from a particular space
	// Dependancies: coordConv, sqCoord, getPiece, oneDirection, knightMoves, pawnMoves
	validMoves = (square, stm) => {
		const sqCoords = this.sqCoord(square)
			.split('')
			.map(e => +e)
		const { 0: xS, 1: yS } = sqCoords
		let arr = []

		const piece = this.board.find(e => e.square === square).cP
		const od = this.oneDirection

		switch (piece) {
			case 'r':
			case 'R':
				//#region  Rook Moves
				arr.push(od(square, 'n', stm))
				arr.push(od(square, 's', stm))
				arr.push(od(square, 'e', stm))
				arr.push(od(square, 'w', stm))
				//#endregion
				break

			case 'n':
			case 'N':
				//#region Knight Moves
				arr.push(this.knightMoves(xS, yS, stm))
				//#endregion
				break

			case 'b':
			case 'B':
				//#region Bishop Moves
				arr.push(od(square, 'nw', stm))
				arr.push(od(square, 'ne', stm))
				arr.push(od(square, 'sw', stm))
				arr.push(od(square, 'se', stm))
				//#endregion
				break

			case 'q':
			case 'Q':
				//#region Queen Moves
				for (let d in this.dir) {
					arr.push(od(square, d, stm))
				}
				//#endregion
				break

			case 'k':
			case 'K':
				//#region King Moves
				for (let d in this.dir) {
					arr.push(od(square, d, stm, 1))
				}
				// filter out illegal king moves
				// arr = arr.filter(e => this.pvm.findIndex(f => f.square === e.newSq) === -1)

				// handle castling
				// White Kingside index
				const wKs = this.castlingAbility.indexOf('K')
				// White Queenside index
				const wQs = this.castlingAbility.indexOf('Q')
				// Black Kingside index
				const bKs = this.castlingAbility.indexOf('k')
				// Black Queenside index
				const bQs = this.castlingAbility.indexOf('q')

				if (wKs !== -1 && !this.board[40].cP && !this.board[48].cP) {
					arr.push({ newSq: 'g1', type: 'move castle', origin: 'e1', castle: 'f1', cOrigin: 'h1' })
				}
				if (wQs !== -1 && !this.board[24].cP && !this.board[16].cP && !this.board[8].cP) {
					arr.push({ newSq: 'c1', type: 'move castle', origin: 'e1', castle: 'd1', cOrigin: 'a1' })
				}

				if (bKs !== -1 && !this.board[47].cP && !this.board[55].cP) {
					arr.push({ newSq: 'g8', type: 'move castle', origin: 'e8', castle: 'f8', cOrigin: 'h8' })
				}
				if (bQs !== -1 && !this.board[31].cP && !this.board[23].cP && !this.board[15].cP) {
					arr.push({ newSq: 'c8', type: 'move castle', origin: 'e8', castle: 'd8', cOrigin: 'a8' })
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
		const output = this.board
			.filter(e => e.side === this.sideToMove)
			.map(f => this.validMoves(f.square).filter(h => !this.moveChecker(h)))
			.flat()
			.filter(g => g !== '')

		return output
	}

	// Used to clean move list generated by validMoves() method
	moveChecker = ({ newSq, origin, castle, cOrigin }) => {
		
		const oppstm = this.sideToMove === 'w' ? 'b' : 'w'
		// Is king CURRENTLY in check?
		// Get all possible moves by opp side BEFORE move
		const preMoveOppMoves = this.board
			.filter(e => e.side === oppstm)
			.map(f => this.validMoves(f.square, oppstm).filter(mv => mv.atkP === 'k' || mv.atkP === 'K'))
			.flat()

		if (preMoveOppMoves) {
			if (preMoveOppMoves.findIndex(e => e.newSq === newSq) !== -1){
				return false
			}
		} 
		// console.table(preMoveOppMoves)
		// Will move place king in check?

		// MAKE MOVE
		this.board.forEach(e => {
			if (e.square === newSq) {
				e.mtP = e.cP // MOVE TEST PIECE
				e.mtS = e.side// MOVE TEST SIDE
				e.cPMvCnt++
				e.cP = this.getPiece(origin)
				e.side = this.sideToMove
			} else if (e.square === origin) {
				e.mtP = e.cP // MOVE TEST PIECE
				e.mtS = e.side// MOVE TEST SIDE
				e.cP = ''
				e.side = ''
			} else if (e.square === castle) {
				e.mtP = e.cP // MOVE TEST PIECE
				e.mtS = e.side// MOVE TEST SIDE
				e.cPMvCnt++
				e.cP = this.getPiece(castle)
				e.side = this.sideToMove
			} else if (e.square === cOrigin) {
				e.mtP = e.cP // MOVE TEST PIECE
				e.mtS = e.side// MOVE TEST SIDE
				e.cP = ''
				e.side = ''
			}
		})

		// console.table(this.board)

		// Map through board to make move
		// Filter for opp side
		// Map all moves
		// FIlter for atkP === 'k' or 'K'
		const postMoveOppMoves = this.board
			.filter(e => e.side === oppstm)
			.map(f => this.validMoves(f.square, oppstm).filter(g => g.atkP === 'k' || g.atkP === 'K'))
			.flat()

		// console.table(postMoveOppMoves)
		
		

		// REVERSE MOVE
		this.board.forEach(e => {
			if (e.square === newSq) {
				e.cP = e.mtP
				e.side = e.mtS
				e.cPMvCnt--
				delete e.mtP
				delete e.mtS
			} else if (e.square === origin) {
				e.cP = e.mtP
				e.side = e.mtS
				delete e.mtP
				delete e.mtS
			} else if (e.square === castle) {
				e.cP = e.mtP
				e.side = e.mtS
				e.cPMvCnt--
				delete e.mtP
				delete e.mtS
			} else if (e.square === cOrigin) {
				e.cP = e.mtP
				e.side = e.mtS
				delete e.mtP
				delete e.mtS
			}
		})

		// console.table(this.board)
		if(postMoveOppMoves) return false


		return true
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
	// Must pass empty object at a minimum
	move = ({ newSq, origin, type, castle, cOrigin, promo }) => {
		this.moves.push({ origin, newSq, castle, cOrigin, promo })

		// From square
		// From square piece
		const originP = promo ? promo : this.getPiece(origin)
		// From square index in board array
		const originI = this.board.findIndex(e => e.square === origin)
		// To square
		// To square Piece
		const newSqP = this.getPiece(newSq)
		// To square index
		const newSqI = this.board.findIndex(e => e.square === newSq)

		this.board[originI].pP = originP
		this.board[originI].cP = ''
		this.board[originI].side = ''
		this.board[newSqI].pP = newSqP
		this.board[newSqI].cP = originP
		this.board[newSqI].side = this.sideToMove
		this.board[newSqI].cPMvCnt = +this.board[originI].cPMvCnt + 1

		if (type.includes('atk') || originP.toLowerCase() === 'p') {
			this.halfMoveClock = 0
		} else {
			if (this.halfMoveClock === 50) {
				this.outcome = 'draw'
			} else {
				this.halfMoveClock++
			}
		}

		if (newSqP) this.captures.push(newSqP)

		this.pvm = this.curValidMoves()

		this.pieces = this.boardDrawOrder.map(e => this.getPiece(e))

		if (this.sideToMove === 'w') {
			this.sideToMove = 'b'
		} else {
			this.sideToMove = 'w'
			this.fullMoveCount++
		}

		this.cvm = this.curValidMoves()

		// Handle CastlingAbility prop

		if (origin === 'a1') this.Q = ''
		if (origin === 'h1') this.K = ''
		if (origin === 'e1') this.K = ''
		if (origin === 'e1') this.Q = ''
		if (origin === 'a8') this.q = ''
		if (origin === 'h8') this.k = ''
		if (origin === 'e8') this.k = ''
		if (origin === 'e8') this.q = ''

		this.castlingAbility = `${this.K}${this.Q}${this.k}${this.q}`

		// Handle if castle param is passed
		if (castle) {
			const cSI = this.board.findIndex(e => e.square === castle)
			this.board[cOrigin].pP = originP
			this.board[cOrigin].cP = ''
			this.board[cOrigin].side = ''
			this.board[cSI].pP = ''
			this.board[cSI].cP = 'R'
			this.board[cSI].side = this.sideToMove
			this.board[cSI].cPMvCnt = 1
		}

		// Handle en Passant
		if (originP === 'p' || originP === 'P') {
			const originCoords = this.sqCoord('origin').reduce((acc, cur) => acc + cur, 0)
			const newSqCoords = this.sqCoord('newSq').reduce((acc, cur) => acc + cur, 0)
			const offset = Math.abs(originCoords - newSqCoords)
			if (offset === 2) {
				// Handle White Pawn
				const fX = this.sqCoord('origin')[0]
				if (originP === 'P') {
					this.enPassantTarget = this.coordConv(fX, 2)
				} else if (originP === 'p') {
					this.enPassantTarget = this.coordConv(fX, 5)
				}
			}
		}

		this.fen = this.fenEncoder()
		return this
	}

	/*  To-do
			- Write Perft Function for testing and debugging engine
			- 
			- update api calls in app to new server port
			- wire up front-end
	*/
}

// const game = new ZenChess('8/4B3/2K3p1/1P3p2/5P2/8/3k4/5b2 b - - 7 44')
// const game = new ZenChess('rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6')
// const game = new ZenChess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
// const game = new ZenChess('r1bqkbnr/ppp2Qpp/2np4/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4')
const game = new ZenChess('rnbqkbnr/pp1p1ppp/2p5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 1 3')
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
// 	game.board.filter(e => e.side === game.sideToMove).map(f => game.validMoves(f.square))
// )

console.table(game.curValidMoves())
// console.log(game.moveChecker({ newSq: 'f6', origin: 'f7' }))
// console.log(game.curValidMoves().length)
// console.log(game.move('f6e4', {}))

const engineTester = (fen, depth, i, results) => {}

module.exports = ZenChess
