const MIN_PLAYERS_TO_START = 2;
const MAX_PLAYERS_PER_ROOM = 6;

function canStartGame(game) {
  const playerCount = Array.isArray(game?.players) ? game.players.length : 0;
  return playerCount >= MIN_PLAYERS_TO_START;
}

function isValidRoomCapacity(maxPlayers) {
  const parsedValue = Number(maxPlayers);
  return Number.isInteger(parsedValue) && parsedValue >= MIN_PLAYERS_TO_START && parsedValue <= MAX_PLAYERS_PER_ROOM;
}

module.exports = {
  MIN_PLAYERS_TO_START,
  MAX_PLAYERS_PER_ROOM,
  canStartGame,
  isValidRoomCapacity,
};
