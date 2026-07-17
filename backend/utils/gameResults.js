// XP removed: placement-based rewards no longer used

const normalizeUsername = (value = '') => value.trim().toLowerCase();

const buildRankedResults = (players = []) => {
  const sortedPlayers = [...players]
    .filter((player) => player && player.username)
    .sort((a, b) => {
      const scoreDelta = (b.scores || 0) - (a.scores || 0);
      if (scoreDelta !== 0) return scoreDelta;
      return normalizeUsername(a.username).localeCompare(normalizeUsername(b.username));
    });

  const results = [];
  let currentIndex = 0;

  while (currentIndex < sortedPlayers.length) {
    const currentPlayer = sortedPlayers[currentIndex];
    const currentScore = currentPlayer.scores || 0;
    const tiedPlayers = sortedPlayers.filter((player) => (player.scores || 0) === currentScore);
    const placement = currentIndex + 1;
    const isDraw = tiedPlayers.length > 1;

    tiedPlayers.forEach((player) => {
      results.push({
        username: player.username,
        scores: player.scores || 0,
        placement,
        isDraw,
      });
    });

    currentIndex += tiedPlayers.length;
  }

  return results;
};

module.exports = {
  buildRankedResults,
};
