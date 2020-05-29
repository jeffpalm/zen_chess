require('dotenv').config()

const express = require('express'),
	path = require('path'),
	ctrl = require('./controllers/game_controller'),
	app = express(),
	PORT = process.env.SERVER_PORT || 5000

app.use(express.json())

app.use('/', express.static(path.join(__dirname, '../build')))

app.post('/api/game/new/solo', ctrl.newSoloGame)

app.get('/api/game/:gid', ctrl.getGame)

app.put('/api/game/move/:gid', ctrl.makeMove)

app.delete('/api/game/:gid', ctrl.finishGame)

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
