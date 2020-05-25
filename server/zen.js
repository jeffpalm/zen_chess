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
		this.fenPiecesHelper = ''
		this.fenBoardOrderHelper = JSON.parse(JSON.stringify(drawOrder))

		// External Guides for reference
		this.dir = JSON.parse(JSON.stringify(dir))
		this.cbIndex = JSON.parse(JSON.stringify(cb))
		this.board = JSON.parse(JSON.stringify(board))

		// Props used to construct FEN
		this.moves = []
		this.sideToMove = ''

		this.castlingAbility = `${this.K}${this.Q}${this.k}${this.q}`
		this.K = 'K'
		this.Q = 'Q'
		this.k = 'k'
		this.q = 'q'

		this.enPassantTarget = '-'
		this.eptCap = ''

		this.halfMoveClock = ''
		this.fullMoveCount = ''

		// List of Current Valid Moves for sideToMove
		this.cvm = []
		// Captured pieces
		this.captures = []
		this.outcome = ''
	}
	static from(json) {
		return Object.assign(new ZenChess(), json)
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

		this.fenPiecesHelper = parsedPieces
		this.fenPiecesHelper.map((e, i) => {
			const sq = this.fenBoardOrderHelper[i]
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
		this.board = this.board.map(sq => {
			let cvm = this.cvm.filter(mv => mv.from === sq.square)
			return { ...sq, cvm, type: cvm.length ? '' : 'invalid' }
		})
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
	getSquare = square => {
		const index = this.board.findIndex(e => e.square === square)
		if (index === -1) return false
		return this.board[index]
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
				output.push({ from: square, to: e, type: 'atk', atkP: cP })
			} else if (counter === 0) {
				output.push({ from: square, to: e, type: 'move' })
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
				output.push({ from: this.coordConv(xS, yS), to: e, type: 'atk' })
			} else {
				output.push({ from: this.coordConv(xS, yS), to: e, type: 'move' })
			}
		})

		return output
	}

	// Returns an array of objects representing valid pawn moves
	pawnMoves = (xS, yS, stm) => {
		const output = []
		const ept = this.enPassantTarget
		const eptP = this.getPiece(this.eptCap)

		const from = this.coordConv(xS, yS)
		switch (stm) {
			case 'w':
				//#region WHITE PAWN MOVES
				const wMOneName = this.coordConv(xS, yS + 1)
				const wMOnePiece = this.getPiece(wMOneName)
				if (yS + 1 < 7) {
					if (!wMOnePiece) {
						// If cP is BLANK
						output.push({ from, to: wMOneName, type: 'move' })
						if (yS === 1) {
							// If Pawn still on starting rank
							const wMTwoName = this.coordConv(xS, yS + 2)
							const wMTwoPiece = this.getPiece(wMTwoName)
							if (!wMTwoPiece) {
								output.push({ from, to: wMTwoName, type: 'move' })
							}
						}
					}
				} else if (yS + 1 === 7 && !wMOnePiece) {
					output.push({ from, to: wMOneName, type: 'promo', promo: 'Q' })
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
							to: wAOneName,
							// Check if attack is promo square
							type: yS + 1 === 7 ? 'atk promo' : 'atk',
							from,
							promo: yS + 1 === 7 ? 'Q' : null,
							atkP: wAOnePiece
						})
					}
				}
				// Check if piece is occupying attack square 2
				if (wATwoPiece) {
					// Check if piece is black
					if (wATwoPiece === wATwoPiece.toLowerCase()) {
						output.push({
							to: wATwoName,
							// Check if attack is promo square
							type: yS + 1 === 7 ? 'atk promo' : 'atk',
							from,
							promo: yS + 1 === 7 ? 'Q' : null,
							atkP: wATwoPiece
						})
					}
				}
				// Checks en Passant target
				if (wAOneName === ept || (wATwoName === ept && eptP)) {
					if (eptP === eptP.toLowerCase()) {
						output.push({ from, to: ept, type: 'atk ep', atkP: eptP })
					}
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
						output.push({ from, to: bMOneName, type: 'move' })
						if (yS === 6) {
							// If Pawn still on starting rank
							const bMTwoName = this.coordConv(xS, yS - 2)
							const bMTwoPiece = this.getPiece(bMTwoName)
							if (!bMTwoPiece) {
								output.push({ from, to: bMTwoName, type: 'move' })
							}
						}
					}
				} else if (yS - 1 === 0 && !bMOnePiece) {
					output.push({ from, to: bMOneName, type: 'promo', promo: 'q' })
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
							to: bAOneName,
							// Check if attack is promo square
							type: yS - 1 === 0 ? 'atk promo' : 'atk',
							from,
							promo: yS - 1 === 0 ? 'q' : null,
							atkP: bAOnePiece
						})
					}
				}
				// Check if piece is occupying attack square 2
				if (bATwoPiece) {
					// Check if piece is black
					if (bATwoPiece === bATwoPiece.toUpperCase()) {
						output.push({
							to: bATwoName,
							// Check if attack is promo square
							type: yS - 1 === 0 ? 'atk promo' : 'atk',
							from,
							promo: yS - 1 === 0 ? 'q' : null,
							atkP: bATwoPiece
						})
					}
				}
				// Checks en Passant target
				// console.log('ept', ept)
				// console.log('eptP', eptP)
				// console.log('bAOneName', bAOneName)
				// console.log('bATwoName', bATwoName)
				if (bAOneName === ept || (bATwoName === ept && eptP)) {
					if (eptP === eptP.toUpperCase()) {
						output.push({ from, to: ept, type: 'atk ep', atkP: eptP })
					}
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

				// handle castling
				// White Kingside index
				const wKs = this.castlingAbility.indexOf('K')
				// White Queenside index
				const wQs = this.castlingAbility.indexOf('Q')
				// Black Kingside index
				const bKs = this.castlingAbility.indexOf('k')
				// Black Queenside index
				const bQs = this.castlingAbility.indexOf('q')

				if (wKs !== -1 && !this.board[61].cP && !this.board[62].cP) {
					arr.push({
						to: 'g1',
						type: 'move castle',
						from: 'e1',
						castle: 'f1',
						cOrigin: 'h1'
					})
				}
				if (
					wQs !== -1 &&
					!this.board[57].cP &&
					!this.board[58].cP &&
					!this.board[59].cP
				) {
					arr.push({
						to: 'c1',
						type: 'move castle',
						from: 'e1',
						castle: 'd1',
						cOrigin: 'a1'
					})
				}

				if (bKs !== -1 && !this.board[5].cP && !this.board[6].cP) {
					arr.push({
						to: 'g8',
						type: 'move castle',
						from: 'e8',
						castle: 'f8',
						cOrigin: 'h8'
					})
				}
				if (
					bQs !== -1 &&
					!this.board[1].cP &&
					!this.board[2].cP &&
					!this.board[3].cP
				) {
					arr.push({
						to: 'c8',
						type: 'move castle',
						from: 'e8',
						castle: 'd8',
						cOrigin: 'a8'
					})
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

		// Used to determine if game is stalemate or checkmate
		// let potKingAttacks = 0

		const output = this.board
			.filter(e => e.side === this.sideToMove)
			.map(f => this.validMoves(f.square))
			.flat()
			.filter(g => {
				let mc = this.moveChecker(g)

				// console.log(g,'MC __________________________')
				// console.table(mc)

				let test = mc.findIndex(h => h.atkP === 'k' || h.atkP === 'K')

				// console.log('TEST ____________________________')
				// console.table(test)

				if (test === -1) {
					return true
				} else {
					// potKingAttacks += test / test
					return false
				}
			})

		// if (!output.length && potKingAttacks) {
		// 	this.outcome = 'mate'
		// } else if (!output.length && !potKingAttacks) {
		// 	this.outcome = 'stalemate'
		// }

		return output
	}

	// returns a list of all atacking moves for turn + 1 based on move
	moveChecker = ({ from, to, castle, cOrigin }, stm) => {
		if (!stm) stm = this.sideToMove
		const oppstm = stm === 'w' ? 'b' : 'w'
		const fromP = this.getPiece(from)
		const castleP = this.getPiece(cOrigin)

		// MAKE MOVE
		this.board.forEach(e => {
			if (e.square === to) {
				e.mtP = e.cP // MOVE TEST PIECE
				e.mtS = e.side // MOVE TEST SIDE
				e.cPMvCnt++
				e.cP = fromP
				e.side = stm
			} else if (e.square === from) {
				e.mtP = e.cP // MOVE TEST PIECE
				e.mtS = e.side // MOVE TEST SIDE
				e.cP = ''
				e.side = ''
			} else if (e.square === castle) {
				e.mtP = e.cP // MOVE TEST PIECE
				e.mtS = e.side // MOVE TEST SIDE
				e.cPMvCnt++
				e.cP = castleP
				e.side = stm
			} else if (e.square === cOrigin) {
				e.mtP = e.cP // MOVE TEST PIECE
				e.mtS = e.side // MOVE TEST SIDE
				e.cP = ''
				e.side = ''
			}
		})
		// console.table(this.board)
		// Map through board to make move
		// Filter for opp side
		// Map all moves

		const postMoveOppMoves = this.board
			.filter(e => e.side === oppstm)
			.map(f => this.validMoves(f.square, oppstm))
			.flat()

		// REVERSE MOVE
		this.board.forEach(e => {
			if (e.square === to) {
				e.cP = e.mtP
				e.side = e.mtS
				e.cPMvCnt--
				delete e.mtP
				delete e.mtS
			} else if (e.square === from) {
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

		return postMoveOppMoves
	}

	// Takes current props and converts to FEN
	fenEncoder = () => {
		let output
		let blankCount = 0
		output = this.fenPiecesHelper.reduce((acc, cur, i) => {
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

	move = ({ from, to, type, castle, cOrigin, promo }) => {
		const { eptCap } = this
		const fromSq = this.getSquare(from)
		const fromP = fromSq.cP
		let fromCt = fromSq.cPMvCnt
		const fromSide = fromSq.side

		let cOriginSq
		let cOriginP
		let cOriginCt
		let cOriginSide

		if (castle) {
			cOriginSq = this.getSquare(cOrigin)
			cOriginP = cOriginSq.cP
			cOriginCt = cOriginSq.cPMvCnt
			cOriginSide = cOriginSq.side
		}

		this.moves.push({ from, to, type, castle, cOrigin, promo })

		// Making Move on Board
		this.board.forEach(sq => {
			switch (sq.square) {
				case cOrigin:
				case from:
					sq.pP = sq.cP
					sq.cP = ''
					sq.side = ''
					sq.cPMvCnt = 0
					break

				case to:
					if (sq.cP) this.captures.push(sq.cP)
					sq.pP = sq.cP
					sq.cP = promo ? promo : fromP
					sq.side = fromSide
					sq.cPMvCnt = ++fromCt
					break

				case castle:
					sq.pP = sq.cP
					sq.cP = cOriginP
					sq.side = cOriginSide
					sq.cPMvCnt = ++cOriginCt
					break

				case eptCap:
					if (type.includes('ep')) {
						sq.pP = sq.cP
						sq.cP = ''
						sq.side = ''
						sq.cPMvCnt = 0
					}
					break
			}
		})

		// Check if king in check
		const kingThreats = this.curValidMoves().filter(
			e => this.getPiece(e.to) === 'k' || this.getPiece(e.to) === 'K'
		)
		kingThreats.length ? (this.outcome = 'check') : (this.outcome = '')

		//#region Change side and increment fullMoveCount if necessary
		if (this.sideToMove === 'w') {
			this.sideToMove = 'b'
		} else if (this.sideToMove === 'b') {
			this.sideToMove = 'w'
			this.fullMoveCount++
		}
		//#endregion

		//#region Update castling ability
		if (from === 'a1') this.Q = ''
		if (from === 'h1') this.K = ''
		if (from === 'e1') this.K = ''
		if (from === 'e1') this.Q = ''
		if (from === 'a8') this.q = ''
		if (from === 'h8') this.k = ''
		if (from === 'e8') this.k = ''
		if (from === 'e8') this.q = ''

		this.castlingAbility = `${
			this.K + this.Q + this.k + this.q === ''
				? '-'
				: this.K + this.Q + this.k + this.q
		}`
		//#endregion

		//#region Handle En Passant
		if (fromP === 'p' || fromP === 'P') {
			const fromCoords = this.sqCoord(from)
				.split('')
				.map(e => +e)
				.reduce((acc, cur) => acc + cur, 0)
			const toCoords = this.sqCoord(to)
				.split('')
				.map(e => +e)
				.reduce((acc, cur) => acc + cur, 0)
			const offset = Math.abs(fromCoords - toCoords)
			if (offset === 2) {
				// Handle White Pawn
				const fX = this.sqCoord(from)[0]
				if (fromP === 'P') {
					this.enPassantTarget = this.coordConv(fX, 2)
					this.eptCap = this.coordConv(fX, 3)
				} else if (fromP === 'p') {
					this.enPassantTarget = this.coordConv(fX, 5)
					this.eptCap = this.coordConv(fX, 4)
				}
			}
		} else {
			this.enPassantTarget = '-'
		}
		//#endregion

		//#region Handle HalfMoveClock
		if (type.includes('atk') || fromP.toLowerCase() === 'p') {
			this.halfMoveClock = 0
		} else {
			if (this.halfMoveClock === 50) {
				this.outcome = 'draw'
			} else {
				this.halfMoveClock++
			}
		}
		//#endregion

		//#region Update FEN
		this.fenPiecesHelper = this.fenBoardOrderHelper.map(e => this.getPiece(e))
		this.fen = this.fenEncoder()
		//#endregion

		// Update current valid moves
		this.cvm = this.curValidMoves()

		// Check for mate
		if (!this.cvm.length && kingThreats.length) {
			this.outcome = 'mate'
		} else if (!this.cvm.length && !kingThreats.length) {
			this.outcome = 'stalemate'
		}

		this.board.forEach(e => {
			e.cvm = this.cvm.filter(f => f.from === e.square)
			e.type = e.cvm.length ? '' : 'invalid'
		})
	}

	printBoard = () => {
		const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
		const ranks = [1, 2, 3, 4, 5, 6, 7, 8]
		const board = ranks.reverse().map(r => {
			const row = {}
			for (let i = 0; i < 8; i++) {
				row[files[i]] = this.getPiece(`${files[i]}${r}`)
			}
			return row
		})
		console.table(board)
	}
}

// const game = new ZenChess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

// game.init()

// console.table(game.board)

const engineTester = (fen, depth, i, results) => {}

module.exports = ZenChess
