const express = require('express')
const han = require('./controllers/handler')

const app = express()
const SERVER_PORT = 9342

app.use(express.json())
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	next()
})

app.post('/game', han.newGame)
app.post('/game/moves', han.moves)

app.listen(SERVER_PORT, () => console.log(`Server listening on port ${SERVER_PORT}`))
