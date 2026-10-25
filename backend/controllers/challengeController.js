const User = require('../models/User');
const Topic = require('../models/Topic');
const DailyChallengeContent = require('../models/DailyChallengeContent');
const DailyChallengeProgress = require('../models/DailyChallengeProgress');
const { buildDailyChallenges, verifyChallengeQuestions } = require('../services/dailyChallengeService');
const { getDateInTimezone } = require('../services/gamificationRules');
const {
  awardXP,
  checkAndUnlockAchievements,
  recordDailyActivity,
} = require('../services/gamificationService');

function validateTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
  } catch {
    const error = new Error('A valid IANA timezone is required.');
    error.statusCode = 400;
    throw error;
  }
}

async function getStudentDate(user, requestedTimeZone) {
  const initialTimeZone = user.streakTimezone || requestedTimeZone || 'UTC';
  validateTimeZone(initialTimeZone);
  let storedTimeZone = user.streakTimezone;
  if (!storedTimeZone) {
    const updated = await User.findOneAndUpdate(
      { _id: user._id, $or: [{ streakTimezone: null }, { streakTimezone: { $exists: false } }] },
      { $set: { streakTimezone: initialTimeZone } },
      { new: true }
    );
    storedTimeZone = updated?.streakTimezone || (await User.findById(user._id)).streakTimezone;
  }
  return {
    date: getDateInTimezone(new Date(), storedTimeZone || 'UTC'),
    timeZone: storedTimeZone || 'UTC',
  };
}

async function getDailyContent(date, grade) {
  let content = await DailyChallengeContent.findOne({ challengeDate: date, grade });
  if (content) return content;

  const topics = await Topic.find({ grade }).sort({ order: 1 }).select('title standardCode category');
  const challenges = buildDailyChallenges(date, grade, topics);
  if (!verifyChallengeQuestions(challenges)) {
    throw new Error(`Daily challenge generation produced an invalid answer set for ${date}, grade ${grade}.`);
  }

  try {
    content = await DailyChallengeContent.create({ challengeDate: date, grade, challenges });
  } catch (error) {
    if (error.code !== 11000) throw error;
    content = await DailyChallengeContent.findOne({ challengeDate: date, grade });
    if (!content) throw error;
  }
  return content;
}

function toPublicChallenge(challenge, progress) {
  const remainingSeconds = challenge.durationSeconds > 0 && progress?.startedAt
    ? Math.max(
        0,
        challenge.durationSeconds - Math.floor((Date.now() - progress.startedAt.getTime()) / 1000)
      )
    : challenge.durationSeconds;
  return {
    code: challenge.code,
    title: challenge.title,
    description: challenge.description,
    standardCode: challenge.standardCode,
    durationSeconds: challenge.durationSeconds,
    rewardXP: challenge.rewardXP,
    questionCount: challenge.questions.length,
    questions: challenge.questions.map((question, questionIndex) => ({
      questionIndex,
      questionText: question.questionText,
      options: question.options,
    })),
    answeredCount: progress?.answers.length || 0,
    completed: Boolean(progress?.completed),
    expired: Boolean(progress?.expired || (progress?.startedAt && challenge.durationSeconds > 0 && remainingSeconds === 0)),
    remainingSeconds,
  };
}

exports.getDailyChallenges = async (req, res, next) => {
  try {
    const { date, timeZone } = await getStudentDate(req.user, req.query.timeZone);
    const content = await getDailyContent(date, req.user.grade);
    const progress = await DailyChallengeProgress.find({
      userId: req.user._id,
      challengeDate: date,
    });
    const progressByCode = new Map(progress.map((entry) => [entry.challengeCode, entry]));
    const completedCount = progress.filter((entry) => entry.completed).length;
    const allComplete = completedCount === content.challenges.length;
    const user = await User.findById(req.user._id).select('+xpAwardKeys');
    const bonusChestClaimed = (user.xpAwardKeys || []).includes(`challenge-chest:${date}`);

    return res.status(200).json({
      success: true,
      data: {
        date,
        timeZone,
        grade: req.user.grade,
        challenges: content.challenges.map((challenge) =>
          toPublicChallenge(challenge, progressByCode.get(challenge.code))
        ),
        completedCount,
        bonusChest: {
          unlocked: allComplete,
          claimed: bonusChestClaimed,
          rewardXP: 60,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.submitDailyChallengeAnswer = async (req, res, next) => {
  try {
    const { challengeCode } = req.params;
    const { questionIndex, selectedOptionIndex } = req.body;
    if (!Number.isInteger(questionIndex) || !Number.isInteger(selectedOptionIndex)) {
      return res.status(400).json({
        success: false,
        message: 'questionIndex and selectedOptionIndex must be integers.',
      });
    }

    const { date, timeZone } = await getStudentDate(req.user, req.body.timeZone);
    const content = await getDailyContent(date, req.user.grade);
    const challenge = content.challenges.find((entry) => entry.code === challengeCode);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Daily challenge not found.' });
    }
    const question = challenge.questions[questionIndex];
    if (!question || selectedOptionIndex < 0 || selectedOptionIndex >= question.options.length) {
      return res.status(400).json({ success: false, message: 'Question or answer selection is invalid.' });
    }

    const existing = await DailyChallengeProgress.findOne({
      userId: req.user._id,
      challengeDate: date,
      challengeCode,
    });
    if (existing?.completed) {
      return res.status(409).json({ success: false, message: 'This challenge is already complete.' });
    }
    if (existing?.expired) {
      return res.status(409).json({ success: false, message: 'The timed challenge has expired for today.' });
    }
    if (
      existing?.startedAt
      && challenge.durationSeconds > 0
      && Date.now() - existing.startedAt.getTime() >= challenge.durationSeconds * 1000
    ) {
      await DailyChallengeProgress.updateOne(
        { _id: existing._id },
        { $set: { expired: true } }
      );
      return res.status(409).json({ success: false, message: 'Time is up for this challenge.' });
    }
    const expectedIndex = existing?.answers.length || 0;
    if (questionIndex !== expectedIndex) {
      return res.status(409).json({
        success: false,
        message: `Answer question ${expectedIndex + 1} before continuing.`,
      });
    }

    const isCorrect = selectedOptionIndex === question.correctOptionIndex;
    const isChallengeComplete = expectedIndex + 1 === challenge.questions.length;
    let attempt;
    try {
      attempt = await DailyChallengeProgress.findOneAndUpdate(
        {
          userId: req.user._id,
          challengeDate: date,
          challengeCode,
          completed: false,
          'answers.questionIndex': { $ne: questionIndex },
        },
        {
          $setOnInsert: {
            userId: req.user._id,
            challengeDate: date,
            challengeCode,
            startedAt: new Date(),
          },
          $push: {
            answers: { questionIndex, selectedOptionIndex, isCorrect },
          },
          ...(isChallengeComplete
            ? { $set: { completed: true, completedAt: new Date() } }
            : {}),
        },
        { new: true, upsert: true, runValidators: true }
      );
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'This answer was already recorded.' });
      }
      throw error;
    }

    let reward = null;
    let streakUpdate = null;
    let newlyUnlockedBadges = [];
    if (isChallengeComplete) {
      reward = await awardXP(
        req.user._id,
        challenge.rewardXP,
        `challenge:${date}:${challengeCode}`
      );
      streakUpdate = await recordDailyActivity(req.user._id, {
        activityType: 'challenge',
        activityId: `${date}:${challengeCode}`,
        timeZone,
      });

      const completedCount = await DailyChallengeProgress.countDocuments({
        userId: req.user._id,
        challengeDate: date,
        completed: true,
      });
      let bonusChest = { unlocked: completedCount === content.challenges.length, claimed: false, rewardXP: 60 };
      if (bonusChest.unlocked) {
        const chestAward = await awardXP(req.user._id, 60, `challenge-chest:${date}`);
        bonusChest.claimed = chestAward?.awarded || false;
      }

      newlyUnlockedBadges = await checkAndUnlockAchievements(req.user._id, {
        completedChallenge: true,
        challengeCode,
        completedAllDailyChallenges: bonusChest.unlocked,
      });
      newlyUnlockedBadges = [
        ...newlyUnlockedBadges,
        ...(streakUpdate?.newlyUnlockedBadges || []),
      ];

      return res.status(200).json({
        success: true,
        data: {
          isCorrect,
          correctOptionIndex: question.correctOptionIndex,
          explanation: question.explanation,
          completed: true,
          answeredCount: attempt.answers.length,
          remainingSeconds: challenge.durationSeconds > 0
            ? Math.max(0, challenge.durationSeconds - Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000))
            : 0,
          rewardXP: reward?.awarded ? challenge.rewardXP : 0,
          bonusChest,
          streak: streakUpdate,
          newlyUnlockedBadges,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctOptionIndex: question.correctOptionIndex,
        explanation: question.explanation,
        completed: false,
        answeredCount: attempt.answers.length,
        remainingSeconds: challenge.durationSeconds > 0
          ? Math.max(0, challenge.durationSeconds - Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000))
          : 0,
        rewardXP: 0,
        newlyUnlockedBadges,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.toPublicChallenge = toPublicChallenge;
