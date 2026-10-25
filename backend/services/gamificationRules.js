const LEVEL_TIERS = [
  { level: 1, minXP: 0, maxXP: 99, title: 'Novice Cadet' },
  { level: 2, minXP: 100, maxXP: 249, title: 'Math Apprentice' },
  { level: 3, minXP: 250, maxXP: 449, title: 'Equation Explorer' },
  { level: 4, minXP: 450, maxXP: 699, title: 'Georgia Math Champion' },
  { level: 5, minXP: 700, maxXP: Infinity, title: 'Master Mathematician' },
];

const STREAK_MILESTONES = {
  3: 25,
  7: 50,
  14: 100,
  30: 250,
};

function calculateLevel(totalXP = 0) {
  for (let index = LEVEL_TIERS.length - 1; index >= 0; index -= 1) {
    if (totalXP >= LEVEL_TIERS[index].minXP) return LEVEL_TIERS[index].level;
  }
  return 1;
}

function getLevelProgress(totalXP = 0) {
  const currentLevel = calculateLevel(totalXP);
  const currentTier = LEVEL_TIERS.find((tier) => tier.level === currentLevel) || LEVEL_TIERS[0];
  const nextTier = LEVEL_TIERS.find((tier) => tier.level === currentLevel + 1);

  if (!nextTier) {
    return {
      currentLevel,
      currentTier,
      nextTier: null,
      xpInLevel: Math.max(0, totalXP - currentTier.minXP),
      xpNeededForNext: 0,
      percentage: 100,
    };
  }

  const xpInLevel = Math.max(0, totalXP - currentTier.minXP);
  const range = nextTier.minXP - currentTier.minXP;
  return {
    currentLevel,
    currentTier,
    nextTier,
    xpInLevel,
    xpNeededForNext: Math.max(0, nextTier.minXP - totalXP),
    percentage: Math.min(100, Math.round((xpInLevel / range) * 100)),
  };
}

function getDateInTimezone(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function dayDifference(fromDate, toDate) {
  const from = Date.parse(`${fromDate}T00:00:00.000Z`);
  const to = Date.parse(`${toDate}T00:00:00.000Z`);
  return Math.round((to - from) / 86400000);
}

function getMondayWeekKey(date = new Date()) {
  const utcDate = getDateInTimezone(date, 'UTC');
  const weekday = new Date(`${utcDate}T00:00:00.000Z`).getUTCDay();
  const mondayOffset = (weekday + 6) % 7;
  return new Date(Date.parse(`${utcDate}T00:00:00.000Z`) - mondayOffset * 86400000)
    .toISOString()
    .slice(0, 10);
}

function calculateStreakUpdate(userState, activityDate) {
  const currentStreak = userState.currentStreak || 0;
  const previousDate = userState.streakLastActivityDate;
  if (!previousDate) {
    return { currentStreak: 1, freezeUsed: false, activityDates: [activityDate] };
  }

  const daysElapsed = dayDifference(previousDate, activityDate);
  if (daysElapsed <= 0) {
    return { currentStreak, freezeUsed: false, activityDates: [activityDate] };
  }
  if (daysElapsed === 1) {
    return { currentStreak: currentStreak + 1, freezeUsed: false, activityDates: [activityDate] };
  }
  if (daysElapsed === 2 && (userState.streakFreezes || 0) > 0) {
    const freezeDate = getDateInTimezone(
      new Date(Date.parse(`${previousDate}T00:00:00.000Z`) + 86400000),
      'UTC'
    );
    return {
      currentStreak: currentStreak + 1,
      freezeUsed: true,
      activityDates: [freezeDate, activityDate],
    };
  }
  return { currentStreak: 1, freezeUsed: false, activityDates: [activityDate] };
}

module.exports = {
  LEVEL_TIERS,
  STREAK_MILESTONES,
  calculateLevel,
  getLevelProgress,
  getDateInTimezone,
  dayDifference,
  getMondayWeekKey,
  calculateStreakUpdate,
};
