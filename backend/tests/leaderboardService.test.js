const test = require('node:test');
const assert = require('node:assert/strict');
const { createLeaderboard } = require('../services/leaderboardService');

test('leaderboards expose generated profile fields only and retain an out-of-top-ten rank', () => {
  const students = Array.from({ length: 12 }, (_, index) => ({
    _id: `student-${index}`,
    name: `Private Name ${index}`,
    email: `student-${index}@example.test`,
    leaderboardNickname: `MathPal${index}`,
    equippedAvatar: 'fox',
    level: 1,
    totalXP: 120 - index * 10,
    weeklyXP: 120 - index * 10,
    weeklyXPWeek: '2026-10-19',
  }));
  const board = createLeaderboard(students, 'all-time', '2026-10-19', 'student-11');

  assert.equal(board.entries.length, 10);
  assert.equal(board.currentUser.rank, 12);
  assert.equal(board.currentUser.displayName, 'MathPal11');
  assert.equal(board.currentUser.isCurrentUser, true);
  assert.equal('name' in board.entries[0], false);
  assert.equal('email' in board.entries[0], false);
  assert.equal('id' in board.currentUser, false);
});

test('weekly leaderboard treats last week scores as zero without changing persisted XP', () => {
  const board = createLeaderboard([{
    _id: 'student-1',
    leaderboardNickname: 'CosmicFox100',
    level: 2,
    totalXP: 350,
    weeklyXP: 95,
    weeklyXPWeek: '2026-10-19',
  }], 'weekly', '2026-10-26', 'student-1');

  assert.equal(board.entries[0].xp, 0);
  assert.equal(board.currentUser.xp, 0);
});
