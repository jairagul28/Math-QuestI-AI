export function formatXP(xp) {
  if (xp === undefined || xp === null) return '0 XP';
  return `${xp.toLocaleString()} XP`;
}

export function calculateLevel(xp = 0) {
  // 100 XP per level
  return Math.floor(xp / 100) + 1;
}

export function getDifficultyColor(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
    case 'easy':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'intermediate':
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'advanced':
    case 'hard':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

