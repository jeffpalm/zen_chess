const express = require('express')
const app = express()
const ctrl = require('./controllers/game_controller')
const SERVER_PORT = 9342

app.use(express.json())

app.post('/api/game/new/solo', ctrl.newSoloGame)

app.get('/api/game/:gid', ctrl.getGame)

app.put('/api/game/move/:gid', ctrl.makeMove)

app.delete('/api/game/:gid', ctrl.finishGame)

app.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}`))
