const test = require('node:test');
const assert = require('node:assert/strict');
const { buildGameHistoryEntry, updateUserGameHistory } = require('../utils/gameHistory');

test('buildGameHistoryEntry marks the winner as a win and stores the score', () => {
  const entry = buildGameHistoryEntry(
    {
      roomId: 'room-1',
      roomName: 'Quick Sprint',
      players: [
        { username: 'alice', scores: 8 },
        { username: 'bob', scores: 5 },
      ],
    },
    'alice',
    'alice'
  );

  assert.equal(entry.roomId, 'room-1');
  assert.equal(entry.roomName, 'Quick Sprint');
  assert.equal(entry.result, 'win');
  assert.equal(entry.score, 8);
  assert.equal(entry.winner, 'alice');
  assert.ok(entry.playedAt);
});

test('buildGameHistoryEntry marks the losing player as a loss', () => {
  const entry = buildGameHistoryEntry(
    {
      roomId: 'room-2',
      roomName: 'Speed Draw',
      players: [
        { username: 'alice', scores: 4 },
        { username: 'bob', scores: 6 },
      ],
    },
    'bob',
    'bob'
  );

  assert.equal(entry.result, 'win');
  assert.equal(entry.score, 6);
  assert.equal(entry.winner, 'bob');
});

test('updateUserGameHistory stores a history entry for case-variant usernames', async () => {
  const user = {
    username: 'Alice',
    gamesHistory: [],
    totalGames: 0,
    save: async function () {
      this.saved = true;
    },
  };

  const UserModel = {
    find: async (query) => {
      if (Array.isArray(query?.$or)) {
        return [user];
      }
      return [];
    },
  };

  await updateUserGameHistory(UserModel, {
    roomId: 'room-3',
    roomName: 'Case Test',
    players: [{ username: 'alice', scores: 3 }],
  }, 'alice');

  assert.equal(user.gamesHistory.length, 1);
  assert.equal(user.totalGames, 1);
  assert.equal(user.gamesHistory[0].result, 'win');
});
