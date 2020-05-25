const ChessGame = require('../zen')

const fs = require('fs')

let id = 1

module.exports = {
	newSoloGame: (req, res) => {
		let { fen } = req.body

		if (!fen) fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

		const Game = new ChessGame(fen)

		Game.init()

		const activeGames = JSON.parse(
			fs.readFileSync('./server/data/active_games.json')
		)

		activeGames[id] = Game

		fs.writeFileSync(
			'./server/data/active_games.json',
			JSON.stringify(activeGames)
		)
		res.status(200).send({
			gid: id++
		})
	},
	newMultiplayerGame: () => {
		const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

		const Game = new ChessGame(fen)

		Game.init()

		const activeGames = JSON.parse(
			fs.readFileSync('./server/data/active_games.json')
		)

		activeGames[id] = Game

		fs.writeFileSync(
			'./server/data/active_games.json',
			JSON.stringify(activeGames)
		)
		return {gid: id++}
	},
	getGame: (req, res) => {
		const { gid } = req.params
		const activeGames = JSON.parse(
			fs.readFileSync('./server/data/active_games.json')
		)
		console.log(activeGames)

		const Game = activeGames[gid]

		if (!Game) return res.status(404).send('Invalid Game ID')

		const { fen, board, moves, captures, sideToMove, cvm, outcome } = Game

		res.status(200).send({
			fen,
			board,
			moves,
			captures,
			sideToMove,
			cvm,
			outcome
		})
	},
	makeMove: (req, res) => {
		const { gid } = req.params
		const { move } = req.body

		const activeGames = JSON.parse(fs.readFileSync('./server/data/active_games.json'))

		const Game = ChessGame.from(activeGames[gid])

		
		if (!Game) return res.status(404).send('Invalid Game ID')
		
				
		Game.move(move)
		console.log(Game.sideToMove)
		// console.table(Game.board)

		Game.printBoard()

		const { fen, board, moves, captures, sideToMove, cvm, outcome } = Game

		res.status(200).send({
			fen,
			board,
			moves,
			captures,
			sideToMove,
			cvm,
			outcome
		})

		activeGames[gid] = Game

		fs.writeFileSync(
			'./server/data/active_games.json',
			JSON.stringify(activeGames)
		)
	},
	finishGame: (req, res) => {
		const { gid } = req.params

		const activeGames = JSON.parse(
			fs.readFileSync('./server/data/active_games.json')
		)

		const Game = activeGames[gid]

		if (!Game) return res.status(404).send('Invalid Game ID')

		// const { moves, fen, outcome } = activeGames[index]

		delete activeGames[gid]

		// console.log(activeGames)

		res.status(200).send()

		fs.writeFileSync(
			'./server/data/active_games.json',
			JSON.stringify(activeGames)
		)
	}
}
