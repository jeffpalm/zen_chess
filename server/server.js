const express = require('express')
const app = express()
const http = require('http').Server(app)
const ctrl = require('./controllers/game_controller')
// const io = require('socket.io')(http)
const SERVER_PORT = process.env.PORT || 5000

app.use(express.json())

app.get('/', (req, res) => {
	res.sendFile(__dirname + './index.html')
})

// let connections = 0
// let gid

// io.on('new-mp-game', socket => {
// 	console.log(`Player ${socket.id} has connected`)
// 	console.log('Connections: ', connections)
// 	console.log('gid: ', gid)
// 	if (connections === 0) {
// 		gid = ctrl.newMultiplayerGame()
// 		connections++
// 	} else if (connections === 1) {
// 		connections = 0
// 	}
// 	io.emit('new-game', gid)
// })

// if (connections === 1) {
// 	io.emit('')
// }

app.post('/api/game/new/solo', ctrl.newSoloGame)

app.get('/api/game/:gid', ctrl.getGame)

app.put('/api/game/move/:gid', ctrl.makeMove)

app.delete('/api/game/:gid', ctrl.finishGame)

app.listen(SERVER_PORT, () =>
	console.log(`Server listening on port ${SERVER_PORT}`)
)
