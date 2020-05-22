const ChessGame = require('../zen')
const activeGames = require('../data/active_games.json')

let id = 0

module.exports = {
	newGame: (req, res) => {
		const Game = new ChessGame('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
		Game.init()
		activeGames.push({ id, Game })
		console.table(activeGames)
		res.status(200).send({
			gid: id++,
			pieces: Game.pieces,
			board: Game.board,
			cvm: Game.curValidMoves()
		})
	},
	newCustomGame: (req, res) => {
		const { fen } = req.body
		
		const Game = new ChessGame(fen)
		Game.init()
		activeGames.push({ id, Game })
		res.status(200).send({
			gid: id++,
			pieces: Game.pieces,
			board: Game.board,
			cvm: Game.curValidMoves()
		})
	},
	makeMove: (req, res) => {
		const { gid } = req.params
		const { move } = req.body
		const index = activeGames.findIndex(e => e.id === +gid)

		if (index === -1) return res.status(404).send('Invalid Game ID')

		const Game = activeGames[index].Game
		Game.move(move)
		
		const { fen, board, pieces, moves, captures, sideToMove, cvm, outcome } = Game

		res.status(200).send({
			fen,
			board,
			pieces,
			moves,
			captures,
			sideToMove,
			cvm,
			outcome
		})
	}
}
