const normalizeUsername = (value = '') => value.trim().toLowerCase();

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildGameHistoryEntry = (game, winnerUsername, currentUsername) => {
  const player = (game.players || []).find((entry) => normalizeUsername(entry.username) === normalizeUsername(currentUsername));
  const score = player?.scores ?? 0;
  const isWinner = normalizeUsername(winnerUsername) === normalizeUsername(currentUsername);

  return {
    roomId: game.roomId,
    roomName: game.roomName,
    winner: winnerUsername,
    result: isWinner ? 'win' : 'loss',
    score,
    playedAt: new Date(),
  };
};

const updateUserGameHistory = async (User, game, winnerUsername) => {
  const playerUsernames = (game.players || []).map((player) => player.username).filter(Boolean);
  const usernameQueries = playerUsernames.map((username) => ({
    username: new RegExp(`^${escapeRegex(username.trim())}$`, 'i'),
  }));

  const users = await User.find({ $or: usernameQueries });

  for (const user of users) {
    const existing = (user.gamesHistory || []).find((entry) => entry.roomId === game.roomId);
    if (existing) continue;

    user.gamesHistory = [
      ...((user.gamesHistory || []).slice(-9)),
      buildGameHistoryEntry(game, winnerUsername, user.username),
    ];
    user.totalGames = (user.totalGames || 0) + 1;
    await user.save();
  }
};

module.exports = {
  buildGameHistoryEntry,
  updateUserGameHistory,
};
