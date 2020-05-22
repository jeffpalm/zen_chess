const ChessGame = require('../zen')
const activeGames = require('../data/active_games.json')

let id = 0

module.exports = {
	newGame: (req, res) => {
		console.log(req.body)
		const { fen } = req.body
		newGame = new ChessGame(fen)
		newGame.init()
		activeGames.push({ id, newGame })
		res.status(200).send({
			gameID: id++,
			pos: newGame.pieces,
			board: newGame.board,
			cvm: newGame.curValidMoves()
		})
	},
	moves: (req, res) => {
		console.log(req.body)
		let { square } = req.body

		res.status(200).send({
			moves: newGame.validMoves(square)
		})
	}
}
