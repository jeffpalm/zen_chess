const express = require('express')
const app = express()
const ctrl = require('./controllers/game_controller')
const SERVER_PORT = 9342

app.use(express.json())

app.get('/api/game/new', ctrl.newGame)

app.post('/api/game/new', ctrl.newCustomGame)

app.put('/api/game/move/:gid', ctrl.makeMove)

app.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}`))
