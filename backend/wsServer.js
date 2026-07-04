const WebSocket = require('ws');

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

      socket.on('message', (message) => {
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
