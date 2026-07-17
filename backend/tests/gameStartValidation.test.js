const test = require('node:test');
const assert = require('node:assert/strict');
const { canStartGame, MIN_PLAYERS_TO_START, MAX_PLAYERS_PER_ROOM, isValidRoomCapacity } = require('../utils/gameValidation');

test('requires at least the minimum number of players to start', () => {
  assert.equal(canStartGame({ players: [] }), false);
  assert.equal(canStartGame({ players: [{ username: 'one' }] }), false);
  assert.equal(canStartGame({ players: [{ username: 'one' }, { username: 'two' }] }), true);
  assert.equal(MIN_PLAYERS_TO_START, 2);
});

test('restricts room size to the supported maximum of six players', () => {
  assert.equal(isValidRoomCapacity(2), true);
  assert.equal(isValidRoomCapacity(6), true);
  assert.equal(isValidRoomCapacity(7), false);
  assert.equal(MAX_PLAYERS_PER_ROOM, 6);
});
