const ChessGame = require('../zen')

let newGame

module.exports = {
	newGame: (req, res) => {
		console.log(req.body)
		const { fen } = req.body
		newGame = new ChessGame(fen)
		newGame.init()
		res.status(200).send({
			pos: newGame.pieces,
			board: newGame.board
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
