const express = require('express')
const app = express()
const ctrl = require('./controllers/game_controller')
const SERVER_PORT = 9342

app.use(express.json())




app.post('/api/game', ctrl.newGame)
app.post('/api/game/moves', ctrl.moves)

app.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}`))
