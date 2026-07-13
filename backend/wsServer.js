const WebSocket = require('ws');
const ActiveGame = require('./models/ActiveGame');

const rooms = new Map();

function initWebsocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (socket, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const roomId = url.searchParams.get('roomId');
      const username = url.searchParams.get('username');

      if (!roomId || !username) {
        socket.close(1008, 'Missing roomId or username');
        return;
      }

      socket.username = username;
      socket.roomId = roomId;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket);

      socket.on('message', async (message) => {
        let data;
        try {
          data = JSON.parse(message);
        } catch (error) {
          return;
        }

        if (data.type === 'chat' && typeof data.text === 'string') {
          const payload = JSON.stringify({
            type: 'chat',
            message: {
              name: username,
              text: data.text,
              timestamp: Date.now(),
            },
          });

          broadcastToRoom(roomId, payload);
        }

        if (data.type === 'drawStroke' && data.stroke) {
          broadcastToRoom(roomId, JSON.stringify({
            type: 'drawStroke',
            stroke: data.stroke,
            username,
          }));
        }

        if (data.type === 'solveRound') {
          try {
            const game = await ActiveGame.findOne({ roomId, state: 'started' });
            if (!game) return;

            const player = game.players.find((playerEntry) => playerEntry.username === username);
            if (!player || player.hold) return;

            const remainingTime = game.timerSeconds || 45;
            player.hold = true;
            player.scores = (player.scores || 0) + remainingTime;
            await game.save();

            broadcastToRoom(roomId, {
              type: 'roundSolved',
              roomId,
              player: {
                username,
                scores: player.scores,
                hold: Boolean(player.hold),
              },
              players: game.players.map((playerEntry) => ({
                username: playerEntry.username,
                scores: playerEntry.scores || 0,
                hold: Boolean(playerEntry.hold),
              })),
              timerSeconds: game.timerSeconds,
              strokes: Array.isArray(data.strokes) ? data.strokes : [],
              message: `${username} successfully drew ${game.currentWord}!`,
            });
          } catch (error) {
            console.error('Solve round error:', error);
          }
        }
      });

      socket.on('close', () => {
        const room = rooms.get(roomId);
        if (room) {
          room.delete(socket);
          if (room.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      socket.close(1011, 'Server error');
    }
  });

  return wss;
}

function broadcastToRoom(roomId, data) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  });
}

module.exports = {
  initWebsocket,
  broadcastToRoom,
};
