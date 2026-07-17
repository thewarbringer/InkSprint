const test = require('node:test');
const assert = require('node:assert/strict');
const { buildRankedResults } = require('../utils/gameResults');

test('buildRankedResults awards the highest XP to first place and lowers it for later positions', () => {
  const results = buildRankedResults([
    { username: 'alice', scores: 12 },
    { username: 'bob', scores: 9 },
    { username: 'cara', scores: 6 },
  ]);

  assert.deepEqual(results.map((entry) => ({ username: entry.username, placement: entry.placement })), [
    { username: 'alice', placement: 1 },
    { username: 'bob', placement: 2 },
    { username: 'cara', placement: 3 },
  ]);
});

test('buildRankedResults marks ties as draws and shares the same placement-based XP', () => {
  const results = buildRankedResults([
    { username: 'alice', scores: 10 },
    { username: 'bob', scores: 10 },
    { username: 'cara', scores: 4 },
  ]);

  assert.equal(results[0].isDraw, true);
  assert.equal(results[1].isDraw, true);
  assert.equal(results[0].placement, 1);
  assert.equal(results[1].placement, 1);
  // XP removed — placements and draw flags remain
  assert.equal(results[0].xpGain, undefined);
  assert.equal(results[1].xpGain, undefined);
  assert.equal(results[2].xpGain, undefined);
});
