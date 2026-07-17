const normalizeUsername = (value = '') => value.trim().toLowerCase();

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildGameHistoryEntry = (game, winnerUsername, currentUsername, rankedResults = []) => {
  const player = (game.players || []).find((entry) => normalizeUsername(entry.username) === normalizeUsername(currentUsername));
  const score = player?.scores ?? 0;
  
  // Check ranked results for a draw at first place
  const rankedEntry = rankedResults.find((entry) => normalizeUsername(entry.username) === normalizeUsername(currentUsername));

  let result;
  if (rankedEntry && rankedEntry.isDraw && rankedEntry.placement === 1) {
    result = 'draw';
  } else if (winnerUsername && normalizeUsername(winnerUsername) === normalizeUsername(currentUsername)) {
    result = 'win';
  } else {
    result = 'loss';
  }

  return {
    roomId: game.roomId,
    roomName: game.roomName,
    winner: winnerUsername,
    result,
    score,
    playedAt: new Date(),
  };
};

const updateUserGameHistory = async (User, game, winnerUsername, rankedResults = []) => {
  const playerUsernames = (game.players || []).map((player) => player.username).filter(Boolean);
  const usernameQueries = playerUsernames.map((username) => ({
    username: new RegExp(`^${escapeRegex(username.trim())}$`, 'i'),
  }));

  const users = await User.find({ $or: usernameQueries });

  for (const user of users) {
    const existing = (user.gamesHistory || []).find((entry) => entry.roomId === game.roomId);
    if (existing) continue;

    user.gamesHistory = [
      ...(user.gamesHistory || []),
      buildGameHistoryEntry(game, winnerUsername, user.username, rankedResults),
    ];
    user.totalGames = (user.totalGames || 0) + 1;
    await user.save();
  }
};

module.exports = {
  buildGameHistoryEntry,
  updateUserGameHistory,
};

