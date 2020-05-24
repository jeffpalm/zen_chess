const ChessGame = require('../zen')
const activeGames = require('../data/active_games.json')

let id = 1

module.exports = {
	newSoloGame: (req, res) => {
		const { fen } = req.body

		const Game = new ChessGame(fen)

		Game.init()
		activeGames.push({ id, Game })
		console.table(activeGames)
		res.status(200).send({
			gid: id++
		})
	},
	getGame: (req, res) => {
		const { gid } = req.params

		const index = activeGames.findIndex(e => e.id === +gid)

		if (index === -1) return res.status(404).send('Invalid Game ID')

		const Game = activeGames[index].Game

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
		const index = activeGames.findIndex(e => e.id === +gid)

		if (index === -1) return res.status(404).send('Invalid Game ID')

		const Game = activeGames[index].Game
		Game.move(move)
		console.table(Game.board)

		// Game.printBoard()

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
	finishGame: (req, res) => {
		const { gid } = req.params

		const index = activeGames.findIndex(e => e.id === +gid)

		if (index === -1) return res.status(404).send('Invalid Game ID')

		const { moves, fen, outcome } = activeGames[index]

		delete activeGames[index]

		console.table(activeGames)

		res.status(200).send()
	}
}
