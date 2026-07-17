const WebSocket = require('ws');
const ActiveGame = require('./models/ActiveGame');
const User = require('./models/User');

const rooms = new Map();
const PLAYER_STROKE_COLORS = ['#00D4FF', '#ff6b6b', '#22c55e', '#f59e0b', '#8b5cf6', '#f472b6'];

function getStrokeColorForPlayer(username) {
  if (!username) return PLAYER_STROKE_COLORS[0];

  let hash = 0;
  for (let index = 0; index < username.length; index += 1) {
    hash = (hash << 5) - hash + username.charCodeAt(index);
    hash |= 0;
  }

  const safeIndex = Math.abs(hash) % PLAYER_STROKE_COLORS.length;
  return PLAYER_STROKE_COLORS[safeIndex];
}

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
          const strokeColor = data.stroke?.color && data.stroke.color !== '#000000' ? data.stroke.color : getStrokeColorForPlayer(username);
          const broadcastStroke = {
            ...data.stroke,
            color: strokeColor,
          };

          broadcastToRoom(roomId, JSON.stringify({
            type: 'drawStroke',
            stroke: broadcastStroke,
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

      socket.on('close', async () => {
        const room = rooms.get(roomId);
        if (room) {
          room.delete(socket);
          if (room.size === 0) {
            rooms.delete(roomId);
          }
        }

        // Wait a grace period to allow reconnection (page navigation, reload)
        await new Promise((resolve) => { setTimeout(resolve, 4000); });

        // Check if the same user has reconnected to the room
        const currentRoom = rooms.get(roomId);
        if (currentRoom) {
          const reconnected = Array.from(currentRoom).some(
            (client) => client.username === username && client.readyState === WebSocket.OPEN
          );
          if (reconnected) return;
        }

        try {
          const game = await ActiveGame.findOne({ roomId });
          if (!game) return;

          // Only process leave for started games — in 'waiting' state,
          // the player may just be navigating between pages
          if (game.state !== 'started') return;

          // Remove user from players list
          game.players = game.players.filter((p) => p.username !== username);
          await game.save();

          // Broadcast to other players that this player has left
          broadcastToRoom(roomId, {
            type: 'playerLeft',
            roomId,
            username,
            players: game.players.map((p) => ({
              username: p.username,
              scores: p.scores || 0,
              hold: Boolean(p.hold),
            })),
          });

          // Broadcast system message to all other players in the chat
          broadcastToRoom(roomId, {
            type: 'chat',
            message: {
              name: 'System',
              text: `${username} has left the game.`,
              timestamp: Date.now(),
              system: true,
            },
          });
        } catch (error) {
          console.error('Error handling socket close for room:', roomId, error);
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
