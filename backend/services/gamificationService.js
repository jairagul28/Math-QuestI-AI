const User = require('../models/User');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const Achievement = require('../models/Achievement');
const Topic = require('../models/Topic');
const StreakActivity = require('../models/StreakActivity');
const DailyChallengeProgress = require('../models/DailyChallengeProgress');
const {
  LEVEL_TIERS,
  STREAK_MILESTONES,
  calculateLevel,
  getLevelProgress,
  getDateInTimezone,
  getMondayWeekKey,
  dayDifference,
  calculateStreakUpdate,
} = require('./gamificationRules');

const BADGE_DEFINITIONS = [
  {
    badgeCode: 'FIRST_STEPS',
    title: 'First Steps',
    description: 'Completed your very first Georgia Standards math lesson!',
    icon: 'Footprints',
  },
  {
    badgeCode: 'MATH_STARTER',
    title: 'Math Starter',
    description: 'Completed your first interactive quiz quest!',
    icon: 'Sparkles',
  },
  {
    badgeCode: 'PERFECT_SCORE',
    title: 'Perfect Score',
    description: 'Achieved 100% accuracy on a mathematics quiz mission!',
    icon: 'Target',
  },
  {
    badgeCode: 'FRACTION_HERO',
    title: 'Fraction Hero',
    description: 'Conquered the Fractions curriculum practice milestone!',
    icon: 'PieChart',
  },
  {
    badgeCode: 'QUIZ_CHAMPION',
    title: 'Quiz Champion',
    description: 'Successfully completed 5 mathematical quiz quests!',
    icon: 'Trophy',
  },
  {
    badgeCode: 'MATH_EXPLORER',
    title: 'Math Explorer',
    description: 'Studied multiple topics across the Georgia curriculum!',
    icon: 'Compass',
  },
  {
    badgeCode: 'STREAK_3',
    title: 'Three-Day Spark',
    description: 'Learned math on three days in a row!',
    icon: 'Flame',
  },
  {
    badgeCode: 'STREAK_7',
    title: 'Weeklong Wonder',
    description: 'Kept a seven-day learning streak!',
    icon: 'Flame',
  },
  {
    badgeCode: 'STREAK_14',
    title: 'Fortnight Force',
    description: 'Kept a fourteen-day learning streak!',
    icon: 'Flame',
  },
  {
    badgeCode: 'STREAK_30',
    title: 'Month of Math',
    description: 'Kept a thirty-day learning streak!',
    icon: 'Flame',
  },
  {
    badgeCode: 'LEVEL_2',
    title: 'Rising Explorer',
    description: 'Reached Level 2 through math practice!',
    icon: 'Sparkles',
  },
  {
    badgeCode: 'LEVEL_5',
    title: 'MathQuest Legend',
    description: 'Reached the highest MathQuest level!',
    icon: 'Crown',
  },
  {
    badgeCode: 'ACCURACY_90',
    title: 'Sharp Shooter',
    description: 'Scored at least 90% on a quiz.',
    icon: 'Target',
  },
  {
    badgeCode: 'STANDARD_SPECIALIST',
    title: 'Standard Specialist',
    description: 'Mastered a Georgia Mathematics standard.',
    icon: 'BookOpen',
  },
  {
    badgeCode: 'MASTER_5_NR_3',
    title: 'Fraction Standard Master',
    description: 'Mastered the Grade 5 fraction standard 5.NR.3.',
    icon: 'PieChart',
  },
  {
    badgeCode: 'MASTER_6_NR_4',
    title: 'Ratio Standard Master',
    description: 'Mastered the Grade 6 ratio standard 6.NR.4.',
    icon: 'Scale',
  },
  {
    badgeCode: 'ALL_ROUNDER',
    title: 'All-Rounder',
    description: 'Explored four different math topic areas.',
    icon: 'Compass',
  },
  {
    badgeCode: 'QUICK_FIRE',
    title: 'Quick Fire Finisher',
    description: 'Completed a Quick Fire daily challenge.',
    icon: 'Zap',
  },
  {
    badgeCode: 'BOSS_QUEST',
    title: 'Boss Quest Conqueror',
    description: 'Solved a Daily Boss Quest.',
    icon: 'Trophy',
  },
  {
    badgeCode: 'DAILY_TRIO',
    title: 'Daily Challenge Champion',
    description: 'Completed all three daily challenges in one day.',
    icon: 'Award',
  },
  {
    badgeCode: 'QUEST_10',
    title: 'Ten-Quest Trek',
    description: 'Completed ten adaptive quiz quests.',
    icon: 'Map',
  },
  {
    badgeCode: 'CHALLENGE_5',
    title: 'Challenge Collector',
    description: 'Completed five daily challenges.',
    icon: 'Star',
  },
];

const BADGE_DETAILS = {
  FIRST_STEPS: { category: 'Milestone', rarity: 'common', goal: 1, metric: 'lessons' },
  MATH_STARTER: { category: 'Milestone', rarity: 'common', goal: 1, metric: 'quizzes' },
  PERFECT_SCORE: { category: 'Accuracy', rarity: 'epic', goal: 100, metric: 'accuracy' },
  FRACTION_HERO: { category: 'Mastery', rarity: 'rare', goal: 1, metric: 'fractions' },
  QUIZ_CHAMPION: { category: 'Explorer', rarity: 'rare', goal: 5, metric: 'quizzes' },
  MATH_EXPLORER: { category: 'Explorer', rarity: 'common', goal: 2, metric: 'topics' },
  STREAK_3: { category: 'Streak', rarity: 'common', goal: 3, metric: 'streak' },
  STREAK_7: { category: 'Streak', rarity: 'rare', goal: 7, metric: 'streak' },
  STREAK_14: { category: 'Streak', rarity: 'epic', goal: 14, metric: 'streak' },
  STREAK_30: { category: 'Streak', rarity: 'legendary', goal: 30, metric: 'streak' },
  LEVEL_2: { category: 'Milestone', rarity: 'common', goal: 2, metric: 'level' },
  LEVEL_5: { category: 'Milestone', rarity: 'legendary', goal: 5, metric: 'level' },
  ACCURACY_90: { category: 'Accuracy', rarity: 'rare', goal: 90, metric: 'accuracy' },
  STANDARD_SPECIALIST: { category: 'Mastery', rarity: 'rare', goal: 1, metric: 'masteredTopics' },
  MASTER_5_NR_3: { category: 'Mastery', rarity: 'epic', goal: 1, metric: 'mastery5NR3' },
  MASTER_6_NR_4: { category: 'Mastery', rarity: 'epic', goal: 1, metric: 'mastery6NR4' },
  ALL_ROUNDER: { category: 'Explorer', rarity: 'epic', goal: 4, metric: 'categories' },
  QUICK_FIRE: { category: 'Speed', rarity: 'common', goal: 1, metric: 'quickFire' },
  BOSS_QUEST: { category: 'Mastery', rarity: 'epic', goal: 1, metric: 'bossQuests' },
  DAILY_TRIO: { category: 'Milestone', rarity: 'rare', goal: 3, metric: 'dailyTrio' },
  QUEST_10: { category: 'Explorer', rarity: 'rare', goal: 10, metric: 'quizzes' },
  CHALLENGE_5: { category: 'Milestone', rarity: 'epic', goal: 5, metric: 'challenges' },
};

/**
 * Award XP once per completed activity and update the level atomically.
 */
async function awardXP(userId, amount, activityKey) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new TypeError('XP award amount must be a positive number.');
  }
  if (typeof activityKey !== 'string' || !activityKey.trim()) {
    throw new TypeError('An activity key is required to prevent duplicate XP awards.');
  }
  const weekKey = getMondayWeekKey();

  const user = await User.findOneAndUpdate(
    { _id: userId, xpAwardKeys: { $ne: activityKey } },
    [
      {
        $set: {
          totalXP: { $add: [{ $ifNull: ['$totalXP', 0] }, amount] },
          xpAwardKeys: {
            $setUnion: [{ $ifNull: ['$xpAwardKeys', []] }, [{ $literal: activityKey }]],
          },
          weeklyXP: {
            $cond: [
              { $eq: ['$weeklyXPWeek', { $literal: weekKey }] },
              { $add: [{ $ifNull: ['$weeklyXP', 0] }, amount] },
              amount,
            ],
          },
          weeklyXPWeek: { $literal: weekKey },
        },
      },
      {
        $set: {
          level: {
            $switch: {
              branches: [
                { case: { $gte: ['$totalXP', 700] }, then: 5 },
                { case: { $gte: ['$totalXP', 450] }, then: 4 },
                { case: { $gte: ['$totalXP', 250] }, then: 3 },
                { case: { $gte: ['$totalXP', 100] }, then: 2 },
              ],
              default: 1,
            },
          },
        },
      },
    ],
    { new: true, updatePipeline: true }
  );
  const awarded = Boolean(user);
  const currentUser = user || (await User.findById(userId));
  if (!currentUser) return null;

  return {
    totalXP: currentUser.totalXP,
    level: currentUser.level,
    levelInfo: getLevelProgress(currentUser.totalXP),
    weeklyXP: currentUser.weeklyXP,
    weeklyXPWeek: currentUser.weeklyXPWeek,
    awarded,
  };
}

async function recordDailyActivity(userId, { activityType, activityId, timeZone }) {
  let requestedTimeZone = timeZone || 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: requestedTimeZone });
  } catch {
    const error = new Error('A valid IANA timezone is required for streak tracking.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) return null;

  const storedTimeZone = user.streakTimezone || requestedTimeZone;
  const activityDate = getDateInTimezone(new Date(), storedTimeZone);
  let activity;
  try {
    activity = await StreakActivity.create({
      userId,
      activityDate,
      activityType,
      activityId: String(activityId),
      timezone: storedTimeZone,
    });
  } catch (error) {
    if (error.code === 11000) {
      const currentUser = await User.findById(userId);
      return {
        currentStreak: currentUser.currentStreak || 0,
        longestStreak: currentUser.longestStreak || 0,
        streakFreezes: currentUser.streakFreezes || 0,
        activityDate,
        duplicate: true,
        milestones: [],
        newlyUnlockedBadges: [],
      };
    }
    throw error;
  }

  const previousDate = user.streakLastActivityDate;
  const transition = calculateStreakUpdate(user, activityDate);
  const outOfOrderActivity = previousDate && dayDifference(previousDate, activityDate) <= 0;
  const currentStreak = transition.currentStreak;
  const freezeMilestones = new Set(user.streakFreezeMilestones || []);
  const rewardMilestones = new Set(user.streakRewardMilestones || []);
  const reachedMilestones = outOfOrderActivity
    ? []
    : Object.keys(STREAK_MILESTONES)
        .map(Number)
        .filter((milestone) => currentStreak >= milestone && !rewardMilestones.has(milestone));

  let freezes = user.streakFreezes || 0;
  let earnedFreezeMilestone = null;
  if (!outOfOrderActivity && currentStreak > (user.currentStreak || 0) && currentStreak % 7 === 0) {
    if (!freezeMilestones.has(currentStreak)) {
      freezeMilestones.add(currentStreak);
      if (freezes < 2) {
        freezes += 1;
        earnedFreezeMilestone = currentStreak;
      }
    }
  }
  if (transition.freezeUsed) freezes -= 1;

  const activityDates = [...new Set([...(user.streakActivityDates || []), ...transition.activityDates])]
    .slice(-90);
  const update = {
    streakTimezone: storedTimeZone,
    currentStreak,
    longestStreak: Math.max(user.longestStreak || 0, currentStreak),
    streakFreezes: Math.max(0, Math.min(2, freezes)),
    streakActivityDates: activityDates,
    streakFreezeMilestones: [...freezeMilestones],
    streakRewardMilestones: [...new Set([...(user.streakRewardMilestones || []), ...reachedMilestones])],
  };
  if (!outOfOrderActivity) update.streakLastActivityDate = activityDate;

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: update }, { new: true });
  if (transition.freezeUsed) await StreakActivity.updateOne({ _id: activity._id }, { freezeUsed: true });

  const milestoneRewards = [];
  for (const milestone of reachedMilestones) {
    const rewardXP = STREAK_MILESTONES[milestone];
    const award = await awardXP(userId, rewardXP, `streak-milestone:${milestone}`);
    if (award?.awarded) milestoneRewards.push({ days: milestone, xp: rewardXP });
  }
  const newlyUnlockedBadges = await checkAndUnlockAchievements(userId, { streakDays: currentStreak });

  return {
    currentStreak: updatedUser.currentStreak,
    longestStreak: updatedUser.longestStreak,
    streakFreezes: updatedUser.streakFreezes,
    activityDate,
    duplicate: false,
    freezeUsed: transition.freezeUsed,
    earnedFreezeMilestone,
    milestones: milestoneRewards,
    newlyUnlockedBadges,
  };
}

/**
 * Check and unlock achievements for a student based on recent activities
 */
async function checkAndUnlockAchievements(userId, triggerContext = {}) {
  const user = await User.findById(userId);
  if (!user) return [];

  // Fetch already unlocked badge codes
  const existingBadges = await Achievement.find({ userId }).select('badgeCode');
  const unlockedCodes = new Set(existingBadges.map((b) => b.badgeCode));

  const newlyUnlocked = [];

  // 1. FIRST_STEPS check: completed at least 1 lesson
  if (!unlockedCodes.has('FIRST_STEPS')) {
    const lessonProgress = await Progress.findOne({ userId, lessonsCompleted: { $gt: 0 } });
    if (lessonProgress || triggerContext.completedLesson) {
      const def = BADGE_DEFINITIONS.find((b) => b.badgeCode === 'FIRST_STEPS');
      const ach = await Achievement.create({
        userId,
        badgeCode: def.badgeCode,
        title: def.title,
        description: def.description,
        icon: def.icon,
      });
      newlyUnlocked.push(ach);
      unlockedCodes.add(def.badgeCode);
    }
  }

  // 2. MATH_STARTER check: completed at least 1 quiz
  if (!unlockedCodes.has('MATH_STARTER')) {
    const quizCount = await QuizAttempt.countDocuments({ userId, status: 'completed' });
    if (quizCount > 0 || triggerContext.completedQuiz) {
      const def = BADGE_DEFINITIONS.find((b) => b.badgeCode === 'MATH_STARTER');
      const ach = await Achievement.create({
        userId,
        badgeCode: def.badgeCode,
        title: def.title,
        description: def.description,
        icon: def.icon,
      });
      newlyUnlocked.push(ach);
      unlockedCodes.add(def.badgeCode);
    }
  }

  // 3. PERFECT_SCORE check: 100% on any quiz
  if (!unlockedCodes.has('PERFECT_SCORE')) {
    const perfectAttempt = await QuizAttempt.findOne({ userId, accuracy: 100, status: 'completed' });
    if (perfectAttempt || triggerContext.score100) {
      const def = BADGE_DEFINITIONS.find((b) => b.badgeCode === 'PERFECT_SCORE');
      const ach = await Achievement.create({
        userId,
        badgeCode: def.badgeCode,
        title: def.title,
        description: def.description,
        icon: def.icon,
      });
      newlyUnlocked.push(ach);
      unlockedCodes.add(def.badgeCode);
    }
  }

  // 4. QUIZ_CHAMPION check: completed 5 or more quizzes
  if (!unlockedCodes.has('QUIZ_CHAMPION')) {
    const quizCount = await QuizAttempt.countDocuments({ userId, status: 'completed' });
    if (quizCount >= 5) {
      const def = BADGE_DEFINITIONS.find((b) => b.badgeCode === 'QUIZ_CHAMPION');
      const ach = await Achievement.create({
        userId,
        badgeCode: def.badgeCode,
        title: def.title,
        description: def.description,
        icon: def.icon,
      });
      newlyUnlocked.push(ach);
      unlockedCodes.add(def.badgeCode);
    }
  }

  // 5. FRACTION_HERO check: completed fractions quiz or lesson
  if (!unlockedCodes.has('FRACTION_HERO')) {
    // Check if any completed quiz or progress is for a Fractions topic
    const fractionTopics = await Topic.find({ category: 'Fractions' }).select('_id');
    const topicIds = fractionTopics.map((t) => t._id);

    const fractionProgress = await Progress.findOne({
      userId,
      topicId: { $in: topicIds },
      $or: [{ lessonsCompleted: { $gt: 0 } }, { quizzesCompleted: { $gt: 0 } }],
    });

    if (fractionProgress || triggerContext.fractionActivity) {
      const def = BADGE_DEFINITIONS.find((b) => b.badgeCode === 'FRACTION_HERO');
      const ach = await Achievement.create({
        userId,
        badgeCode: def.badgeCode,
        title: def.title,
        description: def.description,
        icon: def.icon,
      });
      newlyUnlocked.push(ach);
      unlockedCodes.add(def.badgeCode);
    }
  }

  // 6. MATH_EXPLORER check: studied at least 2 distinct topics
  if (!unlockedCodes.has('MATH_EXPLORER')) {
    const distinctTopics = await Progress.distinct('topicId', {
      userId,
      $or: [{ lessonsCompleted: { $gt: 0 } }, { quizzesCompleted: { $gt: 0 } }],
    });

    if (distinctTopics.length >= 2 || (triggerContext.distinctTopicCount && triggerContext.distinctTopicCount >= 2)) {
      const def = BADGE_DEFINITIONS.find((b) => b.badgeCode === 'MATH_EXPLORER');
      const ach = await Achievement.create({
        userId,
        badgeCode: def.badgeCode,
        title: def.title,
        description: def.description,
        icon: def.icon,
      });
      newlyUnlocked.push(ach);
      unlockedCodes.add(def.badgeCode);
    }
  }

  for (const milestone of Object.keys(STREAK_MILESTONES).map(Number)) {
    const badgeCode = `STREAK_${milestone}`;
    if (unlockedCodes.has(badgeCode) || (triggerContext.streakDays || 0) < milestone) continue;
    const definition = BADGE_DEFINITIONS.find((badge) => badge.badgeCode === badgeCode);
    const achievement = await Achievement.create({
      userId,
      badgeCode: definition.badgeCode,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
    });
    newlyUnlocked.push(achievement);
  }

  const quizCount = await QuizAttempt.countDocuments({ userId, status: 'completed' });
  const completedChallenges = await DailyChallengeProgress.find({ userId, completed: true })
    .select('challengeCode challengeDate');
  const masteredProgress = await Progress.find({ userId, masteryLevel: 'Mastered' }).select('topicId');
  const masteredTopics = masteredProgress.length;
  const masteredStandardCodes = new Set(
    (await Topic.find({ _id: { $in: masteredProgress.map((progress) => progress.topicId) } })
      .select('standardCode')).map((topic) => topic.standardCode)
  );
  const activeProgress = await Progress.find({
    userId,
    $or: [{ lessonsCompleted: { $gt: 0 } }, { quizzesCompleted: { $gt: 0 } }],
  }).select('topicId');
  const activeTopicIds = activeProgress.map((progress) => progress.topicId);
  const exploredTopics = await Topic.find({ _id: { $in: activeTopicIds } }).select('category');
  const exploredCategories = new Set(exploredTopics.map((topic) => topic.category)).size;
  const bestQuiz = await QuizAttempt.findOne({ userId, status: 'completed' }).sort({ accuracy: -1 });

  const advancedChecks = [
    ['LEVEL_2', (user.level || 1) >= 2],
    ['LEVEL_5', (user.level || 1) >= 5],
    ['ACCURACY_90', Boolean(bestQuiz && bestQuiz.accuracy >= 90)],
    ['STANDARD_SPECIALIST', masteredTopics >= 1],
    ['MASTER_5_NR_3', masteredStandardCodes.has('5.NR.3')],
    ['MASTER_6_NR_4', masteredStandardCodes.has('6.NR.4')],
    ['ALL_ROUNDER', exploredCategories >= 4],
    ['QUICK_FIRE', completedChallenges.some((challenge) => challenge.challengeCode === 'quick-fire')],
    ['BOSS_QUEST', completedChallenges.some((challenge) => challenge.challengeCode === 'boss-quest')],
    ['DAILY_TRIO', triggerContext.completedAllDailyChallenges === true],
    ['QUEST_10', quizCount >= 10],
    ['CHALLENGE_5', completedChallenges.length >= 5],
  ];
  for (const [badgeCode, unlocked] of advancedChecks) {
    if (!unlocked || unlockedCodes.has(badgeCode)) continue;
    const definition = BADGE_DEFINITIONS.find((badge) => badge.badgeCode === badgeCode);
    newlyUnlocked.push(await Achievement.create({
      userId,
      badgeCode,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
    }));
    unlockedCodes.add(badgeCode);
  }

  return newlyUnlocked;
}

/**
 * Return all badges with locked/unlocked state for a user
 */
async function getAllBadgesForUser(userId) {
  const unlocked = await Achievement.find({ userId });
  const user = await User.findById(userId);
  const progressRecords = await Progress.find({ userId });
  const completedQuizzes = await QuizAttempt.find({ userId, status: 'completed' }).select('accuracy topicId');
  const completedChallenges = await DailyChallengeProgress.find({ userId, completed: true })
    .select('challengeCode');
  const activeTopicIds = progressRecords
    .filter((progress) => progress.lessonsCompleted > 0 || progress.quizzesCompleted > 0)
    .map((progress) => progress.topicId);
  const topics = await Topic.find({ _id: { $in: activeTopicIds } }).select('category standardCode');
  const masteredTopicCodes = new Set(
    topics
      .filter((topic) => progressRecords.some((progress) =>
        progress.masteryLevel === 'Mastered'
        && progress.topicId.toString() === topic._id.toString()
      ))
      .map((topic) => topic.standardCode)
  );
  const fractionTopicIds = await Topic.find({ category: 'Fractions' }).distinct('_id');
  const completedFraction = progressRecords.some((progress) =>
    fractionTopicIds.some((topicId) => topicId.toString() === progress.topicId.toString())
    && (progress.lessonsCompleted > 0 || progress.quizzesCompleted > 0)
  );
  const currentDate = getDateInTimezone(new Date(), user.streakTimezone || 'UTC');
  const completedToday = await DailyChallengeProgress.countDocuments({
    userId,
    challengeDate: currentDate,
    completed: true,
  });
  const metrics = {
    lessons: progressRecords.reduce((count, progress) => count + (progress.lessonsCompleted || 0), 0),
    quizzes: completedQuizzes.length,
    accuracy: Math.max(0, ...completedQuizzes.map((quiz) => quiz.accuracy || 0)),
    fractions: completedFraction ? 1 : 0,
    topics: activeTopicIds.length,
    streak: user.currentStreak || 0,
    level: user.level || 1,
    masteredTopics: progressRecords.filter((progress) => progress.masteryLevel === 'Mastered').length,
    mastery5NR3: masteredTopicCodes.has('5.NR.3') ? 1 : 0,
    mastery6NR4: masteredTopicCodes.has('6.NR.4') ? 1 : 0,
    categories: new Set(topics.map((topic) => topic.category)).size,
    quickFire: completedChallenges.some((challenge) => challenge.challengeCode === 'quick-fire') ? 1 : 0,
    bossQuests: completedChallenges.some((challenge) => challenge.challengeCode === 'boss-quest') ? 1 : 0,
    dailyTrio: completedToday,
    challenges: completedChallenges.length,
  };
  const unlockedMap = new Map();
  unlocked.forEach((b) => unlockedMap.set(b.badgeCode, b.unlockedAt));

  return BADGE_DEFINITIONS.map((badge) => ({
    ...badge,
    ...BADGE_DETAILS[badge.badgeCode],
    progress: unlockedMap.has(badge.badgeCode)
      ? BADGE_DETAILS[badge.badgeCode].goal
      : Math.min(
          BADGE_DETAILS[badge.badgeCode].goal,
          metrics[BADGE_DETAILS[badge.badgeCode].metric] || 0
        ),
    progressLabel: `${unlockedMap.has(badge.badgeCode)
      ? BADGE_DETAILS[badge.badgeCode].goal
      : Math.min(
          BADGE_DETAILS[badge.badgeCode].goal,
          metrics[BADGE_DETAILS[badge.badgeCode].metric] || 0
        )}/${BADGE_DETAILS[badge.badgeCode].goal}`,
    isUnlocked: unlockedMap.has(badge.badgeCode),
    unlockedAt: unlockedMap.get(badge.badgeCode) || null,
  }));
}

module.exports = {
  LEVEL_TIERS,
  BADGE_DEFINITIONS,
  calculateLevel,
  getLevelProgress,
  awardXP,
  recordDailyActivity,
  checkAndUnlockAchievements,
  getAllBadgesForUser,
};
