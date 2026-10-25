const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateLevel,
  getLevelProgress,
  getDateInTimezone,
  dayDifference,
  calculateStreakUpdate,
  getMondayWeekKey,
} = require('../services/gamificationRules');

test('keeps the established level thresholds and reports progress to the next tier', () => {
  assert.equal(calculateLevel(0), 1);
  assert.equal(calculateLevel(99), 1);
  assert.equal(calculateLevel(100), 2);
  assert.equal(calculateLevel(250), 3);
  assert.equal(calculateLevel(450), 4);
  assert.equal(calculateLevel(700), 5);
  assert.deepEqual(
    {
      currentLevel: getLevelProgress(75).currentLevel,
      xpNeededForNext: getLevelProgress(75).xpNeededForNext,
      percentage: getLevelProgress(75).percentage,
    },
    { currentLevel: 1, xpNeededForNext: 25, percentage: 75 }
  );
});

test('calculates a local activity date using the stored timezone', () => {
  const lateUtc = new Date('2026-01-02T01:30:00.000Z');
  assert.equal(getDateInTimezone(lateUtc, 'America/Los_Angeles'), '2026-01-01');
  assert.equal(getDateInTimezone(lateUtc, 'Asia/Kolkata'), '2026-01-02');
});

test('increments only for a following calendar day', () => {
  assert.equal(dayDifference('2026-03-08', '2026-03-09'), 1);
  assert.deepEqual(
    calculateStreakUpdate(
      { currentStreak: 4, streakLastActivityDate: '2026-03-08', streakFreezes: 0 },
      '2026-03-09'
    ),
    { currentStreak: 5, freezeUsed: false, activityDates: ['2026-03-09'] }
  );
});

test('uses exactly one freeze for a single missed day and records the covered day', () => {
  assert.deepEqual(
    calculateStreakUpdate(
      { currentStreak: 4, streakLastActivityDate: '2026-03-08', streakFreezes: 1 },
      '2026-03-10'
    ),
    {
      currentStreak: 5,
      freezeUsed: true,
      activityDates: ['2026-03-09', '2026-03-10'],
    }
  );
});

test('resets after multiple missed days without a usable freeze', () => {
  assert.equal(
    calculateStreakUpdate(
      { currentStreak: 4, streakLastActivityDate: '2026-03-08', streakFreezes: 0 },
      '2026-03-11'
    ).currentStreak,
    1
  );
});

test('does not regress streak data for an out-of-order date', () => {
  assert.deepEqual(
    calculateStreakUpdate(
      { currentStreak: 6, streakLastActivityDate: '2026-03-10', streakFreezes: 1 },
      '2026-03-09'
    ),
    { currentStreak: 6, freezeUsed: false, activityDates: ['2026-03-09'] }
  );
});

test('weekly XP period starts on Monday at the UTC boundary', () => {
  assert.equal(getMondayWeekKey(new Date('2026-10-25T23:59:59.000Z')), '2026-10-19');
  assert.equal(getMondayWeekKey(new Date('2026-10-26T00:00:00.000Z')), '2026-10-26');
});
