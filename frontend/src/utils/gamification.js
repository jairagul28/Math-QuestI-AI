const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700];

export function getXPProgress(totalXP = 0) {
  const xp = Math.max(0, Number(totalXP) || 0);
  let levelIndex = LEVEL_THRESHOLDS.length - 1;
  for (let index = 0; index < LEVEL_THRESHOLDS.length; index += 1) {
    if (xp < LEVEL_THRESHOLDS[index]) {
      levelIndex = index - 1;
      break;
    }

  }

  const currentLevel = Math.max(1, levelIndex + 1);
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
  if (nextThreshold === undefined) {
    return { currentLevel, percentage: 100, xpNeeded: 0 };
  }
  const range = nextThreshold - currentThreshold;
  return {
    currentLevel,
    percentage: Math.min(100, Math.round(((xp - currentThreshold) / range) * 100)),
    xpNeeded: Math.max(0, nextThreshold - xp),
  };
}

export function notifyBadgeUnlocks(badges = []) {
  badges.forEach((badge) => {
    window.dispatchEvent(new CustomEvent('mq:badge-unlocked', { detail: badge }));
  });
}
