require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const connectDB = require('./db.js')
const ActiveGame = require('./models/ActiveGame')
const EndedGame = require('./models/EndedGame')
const categories = require('./categories.json')
const User = require('./models/User')
const { initWebsocket, broadcastToRoom } = require('./wsServer.js')
const { updateUserGameHistory } = require('./utils/gameHistory')

const app = express()

app.use(cors())
app.use(express.json())

// Initialize MongoDB connection
connectDB();

const authRoutes = require('./routes/authRoutes');
const activeGameRoutes = require('./routes/activeGameRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/active-game', activeGameRoutes);

app.get('/', (req, res) => {
    res.send('hello')
})

const server = http.createServer(app)
initWebsocket(server)

const getWinner = (players = []) => {
    if (!players.length) return null;

    return players.reduce((leader, player) => {
        if (!leader) return player;
        return (player.scores || 0) > (leader.scores || 0) ? player : leader;
    }, null)?.username || null;
};

const getRandomWord = () => {
    const index = Math.floor(Math.random() * categories.length);
    return categories[index] || '';
};

const archiveGameAsEnded = async (game) => {
    const winnerUsername = getWinner(game.players || []);
    const endedGame = new EndedGame({
        roomId: game.roomId,
        roomName: game.roomName,
        maxPlayers: game.maxPlayers,
        rounds: game.rounds,
        privateRoom: game.privateRoom,
        state: 'ended',
        winner: winnerUsername,
        players: (game.players || []).map((player) => ({
            username: player.username,
            scores: player.scores || 0,
            hold: Boolean(player.hold),
        })),
    });

    await endedGame.save();
    await updateUserGameHistory(User, game, winnerUsername);
    await ActiveGame.deleteOne({ _id: game._id });
};

const getBroadcastPlayers = (game) => (game.players || []).map((player) => ({
    username: player.username,
    scores: player.scores || 0,
    hold: Boolean(player.hold),
}));

const startRoundTimer = () => {
    setInterval(async () => {
        try {
            const games = await ActiveGame.find({ state: 'started' })

            for (const game of games) {
                if ((game.timerSeconds || 45) > 1) {
                    game.timerSeconds = (game.timerSeconds || 45) - 1
                    await game.save()
                    broadcastToRoom(game.roomId, {
                        type: 'timerTick',
                        roomId: game.roomId,
                        timerSeconds: game.timerSeconds,
                    })
                    continue
                }

                const nextRoundsDone = (game.roundsDone || 0) + 1
                game.roundsDone = nextRoundsDone
                game.timerSeconds = 45
                game.players.forEach((player) => {
                    player.hold = false
                })
                game.currentWord = getRandomWord()

                if (nextRoundsDone >= game.rounds) {
                    await archiveGameAsEnded(game)
                    broadcastToRoom(game.roomId, {
                        type: 'gameOver',
                        roomId: game.roomId,
                        state: 'over',
                    })
                    continue
                }

                await game.save()
                broadcastToRoom(game.roomId, {
                    type: 'roundAdvance',
                    roomId: game.roomId,
                    word: game.currentWord,
                    roundsDone: game.roundsDone,
                    rounds: game.rounds,
                    timerSeconds: game.timerSeconds,
                    players: getBroadcastPlayers(game),
                })
            }
        } catch (error) {
            console.error('Round timer error:', error)
        }
    }, 1000)
}

startRoundTimer()

const port = process.env.PORT || 3000

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
