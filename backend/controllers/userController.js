const User = require('../models/User');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const Achievement = require('../models/Achievement');
const { getLevelProgress, getAllBadgesForUser } = require('../services/gamificationService');
const { getDateInTimezone, getMondayWeekKey } = require('../services/gamificationRules');
const { getAvatarCatalog, equipAvatarRewards } = require('../services/rewardCatalog');
const {
  createLeaderboard,
  generateLeaderboardNickname,
} = require('../services/leaderboardService');

// @desc    Get student dashboard data
// @route   GET /api/users/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const user = req.user;

    // 1. Fetch topics for user's grade
    const topics = await Topic.find({ grade: user.grade }).sort({ order: 1 });

    // 2. Fetch user's progress records
    const progressRecords = await Progress.find({ userId: user._id });

    // Map progress by topicId string
    const progressMap = new Map();
    let totalLessonsCompleted = 0;
    let totalQuizzesCompleted = 0;
    let totalAccuracySum = 0;
    let accuracyCount = 0;

    progressRecords.forEach((p) => {
      progressMap.set(p.topicId.toString(), p);
      totalLessonsCompleted += p.lessonsCompleted || 0;
      totalQuizzesCompleted += p.quizzesCompleted || 0;
      if (p.quizzesCompleted > 0) {
        totalAccuracySum += p.accuracy || 0;
        accuracyCount += 1;
      }
    });

    const averageAccuracy = accuracyCount > 0 ? Math.round(totalAccuracySum / accuracyCount) : 0;

    // 3. Assemble topic progress cards
    const topicProgress = topics.map((t) => {
      const p = progressMap.get(t._id.toString());
      return {
        _id: t._id,
        title: t.title,
        slug: t.slug,
        grade: t.grade,
        category: t.category,
        description: t.description,
        standardCode: t.standardCode,
        standardDescription: t.standardDescription,
        difficulty: t.difficulty,
        estimatedMinutes: t.estimatedMinutes,
        lessonsCompleted: p ? p.lessonsCompleted : 0,
        quizzesCompleted: p ? p.quizzesCompleted : 0,
        accuracy: p ? p.accuracy : 0,
        masteryLevel: p ? p.masteryLevel : 'Not Started',
        percentage: p
          ? Math.min(100, Math.round(((p.lessonsCompleted > 0 ? 50 : 0) + (p.quizzesCompleted > 0 ? 50 : 0))))
          : 0,
      };
    });

    // 4. Determine "Continue Learning" topic
    const continueLearningTopic =
      topicProgress.find((t) => t.masteryLevel === 'In Progress') ||
      topicProgress.find((t) => t.masteryLevel === 'Not Started') ||
      topicProgress[0] ||
      null;

    // 5. Fetch recent activity (recent completed quiz attempts)
    const recentAttempts = await QuizAttempt.find({ userId: user._id, status: 'completed' })
      .populate('topicId', 'title slug grade standardCode')
      .sort({ completedAt: -1 })
      .limit(6);

    const recentActivity = recentAttempts.map((attempt) => ({
      id: attempt._id,
      topicTitle: attempt.topicId ? attempt.topicId.title : 'Math Adventure',
      standardCode: attempt.topicId ? attempt.topicId.standardCode : '',
      score: attempt.score,
      accuracy: attempt.accuracy,
      totalQuestions: attempt.totalQuestions,
      earnedXP: attempt.earnedXP,
      completedAt: attempt.completedAt,
    }));

    // 6. Format performance trend for Recharts
    const performanceTrend = recentAttempts
      .slice()
      .reverse()
      .map((attempt, idx) => ({
        quizNumber: `Q${idx + 1}`,
        accuracy: attempt.accuracy,
        earnedXP: attempt.earnedXP,
        date: new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }));

    // 7. Fetch all badges (showing unlocked and locked states)
    const allBadges = await getAllBadgesForUser(user._id);
    const avatarRewards = await getAvatarCatalog(user._id);
    const unlockedAchievements = allBadges.filter((b) => b.isUnlocked);

    // 8. Level progression info
    const levelInfo = getLevelProgress(user.totalXP || 0);
    const streakTimezone = user.streakTimezone || 'UTC';
    const today = getDateInTimezone(new Date(), streakTimezone);
    const weekday = new Date(`${today}T00:00:00.000Z`).getUTCDay();
    const mondayOffset = (weekday + 6) % 7;
    const monday = new Date(Date.parse(`${today}T00:00:00.000Z`) - mondayOffset * 86400000);
    const activityDates = new Set(user.streakActivityDates || []);
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday.getTime() + index * 86400000).toISOString().slice(0, 10);
      return { date, completed: activityDates.has(date), isToday: date === today };
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          grade: user.grade,
          totalXP: user.totalXP,
          level: user.level,
        },
        stats: {
          totalXP: user.totalXP,
          level: user.level,
          levelInfo,
          streak: {
            current: user.currentStreak || 0,
            longest: user.longestStreak || 0,
            freezes: user.streakFreezes || 0,
            timezone: streakTimezone,
            today,
            week,
          },
          lessonsCompleted: totalLessonsCompleted,
          quizzesCompleted: totalQuizzesCompleted,
          averageAccuracy,
        },
        continueLearning: continueLearningTopic,
        topicProgress,
        recentActivity,
        performanceTrend,
        achievements: unlockedAchievements,
        allBadges,
        avatarRewards,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAvatarRewards = async (req, res, next) => {
  try {
    const avatarRewards = await getAvatarCatalog(req.user._id);
    return res.status(200).json({ success: true, data: avatarRewards });
  } catch (error) {
    next(error);
  }
};

exports.equipAvatar = async (req, res, next) => {
  try {
    const { avatarId, accessoryId } = req.body;
    if (!avatarId || !accessoryId) {
      return res.status(400).json({
        success: false,
        message: 'avatarId and accessoryId are required.',
      });
    }
    const avatarRewards = await equipAvatarRewards(req.user._id, avatarId, accessoryId);
    return res.status(200).json({ success: true, data: avatarRewards });
  } catch (error) {
    next(error);
  }
};

exports.getLeaderboardSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Student profile not found.' });
    if (!user.leaderboardNickname) {
      user.leaderboardNickname = generateLeaderboardNickname();
      await user.save();
    }
    return res.status(200).json({
      success: true,
      data: {
        optIn: Boolean(user.leaderboardOptIn),
        nickname: user.leaderboardNickname,
        grade: user.grade,
        hasClassGroup: Boolean(user.classId),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLeaderboardSettings = async (req, res, next) => {
  try {
    if (typeof req.body.optIn !== 'boolean') {
      return res.status(400).json({ success: false, message: 'optIn must be true or false.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Student profile not found.' });
    if (!user.leaderboardNickname) {
      user.leaderboardNickname = generateLeaderboardNickname();
    }
    user.leaderboardOptIn = req.body.optIn;
    await user.save();
    return res.status(200).json({
      success: true,
      data: {
        optIn: user.leaderboardOptIn,
        nickname: user.leaderboardNickname,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const period = req.query.period || 'weekly';
    const gradeFilter = req.query.grade || String(req.user.grade);
    if (!['weekly', 'all-time'].includes(period)) {
      return res.status(400).json({ success: false, message: 'period must be weekly or all-time.' });
    }
    if (!['my-class', '5', '6'].includes(String(gradeFilter))) {
      return res.status(400).json({ success: false, message: 'grade must be my-class, 5, or 6.' });
    }

    const weekKey = getMondayWeekKey();
    const query = { leaderboardOptIn: true };
    let scopeMessage = '';
    if (String(gradeFilter) === 'my-class') {
      if (!req.user.classId) {
        return res.status(200).json({
          success: true,
          data: {
            period,
            grade: 'my-class',
            weeklyReset: 'Monday 00:00 UTC',
            entries: [],
            currentUser: null,
            message: 'Class groups are not configured for this account yet.',
          },
        });
      }
      query.classId = req.user.classId;
    } else {
      query.grade = Number(gradeFilter);
      scopeMessage = `Grade ${gradeFilter}`;
    }

    const students = await User.find(query)
      .select('_id leaderboardNickname equippedAvatar equippedAccessory level totalXP weeklyXP weeklyXPWeek')
      .lean();
    const { entries, currentUser } = createLeaderboard(
      students,
      period,
      weekKey,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      data: {
        period,
        grade: gradeFilter,
        scope: scopeMessage || (gradeFilter === 'my-class' ? 'My Class' : ''),
        weeklyReset: 'Monday 00:00 UTC',
        entries,
        currentUser,
        message: currentUser
          ? ''
          : req.user.leaderboardOptIn
            ? 'No rank is available for this filter yet.'
            : 'Opt in to appear on this leaderboard.',
      },
    });
  } catch (error) {
    next(error);
  }
};
