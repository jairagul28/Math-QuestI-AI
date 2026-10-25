const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Progress = require('../models/Progress');
const groqService = require('../services/groqService');
const { quizGenerationSchema } = require('../utils/schemas');
const { getFallbackQuestions, validateArithmetic } = require('../utils/mathValidator');
const {
  awardXP,
  checkAndUnlockAchievements,
  recordDailyActivity,
} = require('../services/gamificationService');

// Difficulty transition table
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

function getNextDifficulty(currentDifficulty, direction) {
  const currentIndex = DIFFICULTY_LEVELS.indexOf(currentDifficulty);
  if (direction === 'up') {
    return DIFFICULTY_LEVELS[Math.min(DIFFICULTY_LEVELS.length - 1, currentIndex + 1)];
  }
  if (direction === 'down') {
    return DIFFICULTY_LEVELS[Math.max(0, currentIndex - 1)];
  }
  return currentDifficulty;
}

// Points mapping
const POINTS_MAP = {
  easy: 10,
  medium: 20,
  hard: 30,
};

/**
 * Helper to generate or retrieve a pool of questions for a topic
 */
async function generateQuestionsForTopic(topic, grade, requestedDifficulty = 'medium', count = 5) {
  // If Groq is available, attempt to generate questions
  if (groqService.isConfigured()) {
    try {
      const prompt = `You are a certified Georgia mathematics teacher.
Create a set of ${count} multiple-choice math questions for a Grade ${grade} student.

TOPIC: ${topic.title}
GEORGIA MATHEMATICS STANDARD: ${topic.standardCode} - ${topic.standardDescription}
CATEGORY: ${topic.category}
DIFFICULTY LEVEL: ${requestedDifficulty}

Strict Rules:
1. Every question must have EXACTLY 4 distinct multiple-choice options.
2. EXACTLY one option must be mathematically correct.
3. correctOptionIndex must be an integer between 0 and 3 corresponding to the correct option in the options array.
4. Explanations must be step-by-step and show the correct arithmetic calculation.
5. All arithmetic operations must be 100% accurate.

Return STRICT JSON matching this schema:
{
  "grade": ${grade},
  "difficulty": "${requestedDifficulty}",
  "questions": [
    {
      "questionText": "Question statement...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Clear step-by-step mathematical reasoning...",
      "hint": "Helpful hint for struggling students...",
      "difficulty": "${requestedDifficulty}"
    }
  ]
}
DO NOT wrap in Markdown code blocks. Output ONLY raw parseable JSON.`;

      const rawResponse = await groqService.generateCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are an educational AI assistant that outputs strictly valid JSON for multiple-choice Georgia Mathematics Standards questions.',
          },
          { role: 'user', content: prompt },
        ],
        jsonMode: true,
        temperature: 0.2,
        maxTokens: 1800,
      });

      let parsed = typeof rawResponse === 'object' ? rawResponse : JSON.parse(rawResponse);
      const validation = quizGenerationSchema.safeParse(parsed);

      if (validation.success && validation.data.questions.length >= count) {
        return validation.data.questions.map((q) => ({
          ...q,
          difficulty: requestedDifficulty,
          points: POINTS_MAP[requestedDifficulty] || 20,
        }));
      }
    } catch (err) {
      console.warn(`[Quiz Gen] Groq generation error for topic ${topic.slug}: ${err.message}`);
    }
  }

  // Fallback to verified questions
  console.log(`[Quiz Gen] Using verified fallback questions for '${topic.slug}'`);
  return getFallbackQuestions(topic.slug, count);
}

/**
 * @desc    Generate standalone quiz questions
 * @route   POST /api/quizzes/generate
 * @access  Public / Authenticated
 */
exports.generateQuiz = async (req, res, next) => {
  try {
    const { grade, topicId, difficulty = 'medium', questionCount = 5 } = req.body;

    if (!grade || !topicId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide grade and topicId.',
      });
    }

    const parsedGrade = parseInt(grade, 10);
    const parsedCount = parseInt(questionCount, 10) || 5;

    let topic;
    if (mongoose.Types.ObjectId.isValid(topicId)) {
      topic = await Topic.findById(topicId);
    }
    if (!topic) {
      topic = await Topic.findOne({ slug: topicId });
    }

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    const questions = await generateQuestionsForTopic(topic, parsedGrade, difficulty, parsedCount);

    return res.status(200).json({
      success: true,
      topic: {
        id: topic._id,
        title: topic.title,
        grade: topic.grade,
        standardCode: topic.standardCode,
      },
      difficulty,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start an adaptive quiz session
 * @route   POST /api/quizzes/start
 * @access  Private (Student)
 */
exports.startQuizSession = async (req, res, next) => {
  try {
    const { topicId, questionCount = 5 } = req.body;
    const userId = req.user._id;

    if (!topicId) {
      return res.status(400).json({ success: false, message: 'Topic ID is required.' });
    }

    let topic;
    if (mongoose.Types.ObjectId.isValid(topicId)) {
      topic = await Topic.findById(topicId);
    }
    if (!topic) {
      topic = await Topic.findOne({ slug: topicId });
    }

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    const totalQuestions = Math.min(10, Math.max(3, parseInt(questionCount, 10) || 5));

    // Generate questions for this session
    // Start at medium difficulty per Section 3.3
    const questions = await generateQuestionsForTopic(topic, topic.grade, 'medium', totalQuestions);

    // Ensure we have enough questions
    while (questions.length < totalQuestions) {
      const extra = getFallbackQuestions(topic.slug, totalQuestions);
      questions.push(...extra);
    }
    const finalQuestions = questions.slice(0, totalQuestions);

    // Create session attempt in MongoDB
    const attempt = await QuizAttempt.create({
      userId,
      topicId: topic._id,
      totalQuestions,
      currentQuestionIndex: 0,
      currentDifficulty: 'medium',
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      difficultyProgression: [{ questionIndex: 0, difficulty: 'medium' }],
      questions: finalQuestions,
      answers: [],
      score: 0,
      earnedXP: 0,
      status: 'in_progress',
    });

    // Return first question WITHOUT revealing correct answer
    const firstQ = finalQuestions[0];
    const sanitizedFirstQuestion = {
      questionIndex: 0,
      totalQuestions,
      questionText: firstQ.questionText,
      options: firstQ.options,
      difficulty: 'medium',
      points: POINTS_MAP['medium'],
    };

    return res.status(201).json({
      success: true,
      attemptId: attempt._id,
      topic: {
        id: topic._id,
        title: topic.title,
        grade: topic.grade,
        standardCode: topic.standardCode,
      },
      currentDifficulty: 'medium',
      currentQuestion: sanitizedFirstQuestion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit answer for current question and adaptively advance
 * @route   POST /api/quizzes/:attemptId/answer
 * @access  Private (Student)
 */
exports.submitAnswer = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { questionIndex, selectedOptionIndex } = req.body;
    const userId = req.user._id;

    if (questionIndex === undefined || selectedOptionIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'questionIndex and selectedOptionIndex are required.',
      });
    }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt not found.' });
    }

    // Security check: verify ownership
    if (attempt.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this quiz attempt.' });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This quiz has already been completed.',
      });
    }

    // Prevent duplicate submission for this question index
    const alreadyAnswered = attempt.answers.some((a) => a.questionIndex === questionIndex);
    if (alreadyAnswered) {
      return res.status(400).json({
        success: false,
        message: 'Answer has already been submitted for this question.',
      });
    }

    const currentQuestion = attempt.questions[questionIndex];
    if (!currentQuestion) {
      return res.status(400).json({ success: false, message: 'Invalid question index.' });
    }

    // Evaluate answer
    const isCorrect = selectedOptionIndex === currentQuestion.correctOptionIndex;
    const earnedXP = isCorrect ? (POINTS_MAP[attempt.currentDifficulty] || 20) : 0;

    // Record answer
    attempt.answers.push({
      questionIndex,
      selectedOptionIndex,
      isCorrect,
      difficulty: attempt.currentDifficulty,
      earnedXP,
      explanation: currentQuestion.explanation,
      correctOptionIndex: currentQuestion.correctOptionIndex,
    });

    if (isCorrect) {
      attempt.score += earnedXP;
      attempt.earnedXP += earnedXP;
      attempt.correctAnswersCount += 1;
      attempt.consecutiveCorrect += 1;
      attempt.consecutiveIncorrect = 0; // Reset opposite streak
    } else {
      attempt.incorrectAnswersCount += 1;
      attempt.consecutiveIncorrect += 1;
      attempt.consecutiveCorrect = 0; // Reset opposite streak
    }

    // ================= ADAPTIVE DIFFICULTY ALGORITHM =================
    // 2 consecutive correct -> level up
    // 2 consecutive incorrect -> level down
    let nextDifficulty = attempt.currentDifficulty;

    if (attempt.consecutiveCorrect >= 2) {
      nextDifficulty = getNextDifficulty(attempt.currentDifficulty, 'up');
      attempt.consecutiveCorrect = 0; // Reset streak after adapting
    } else if (attempt.consecutiveIncorrect >= 2) {
      nextDifficulty = getNextDifficulty(attempt.currentDifficulty, 'down');
      attempt.consecutiveIncorrect = 0; // Reset streak after adapting
    }

    attempt.currentDifficulty = nextDifficulty;
    attempt.currentQuestionIndex = questionIndex + 1;

    const isQuizComplete = attempt.currentQuestionIndex >= attempt.totalQuestions;

    let newlyUnlockedBadges = [];
    let userLevelInfo = null;
    let streakUpdate = null;

    if (isQuizComplete) {
      attempt.status = 'completed';
      attempt.completedAt = new Date();
      attempt.accuracy = Math.round((attempt.correctAnswersCount / attempt.totalQuestions) * 100);

      // Award XP to student user profile
      if (attempt.earnedXP > 0) {
        userLevelInfo = await awardXP(userId, attempt.earnedXP, `quiz:${attempt._id}`);
      }

      // Update student Progress record in MongoDB
      const topic = await Topic.findById(attempt.topicId);
      let progress = await Progress.findOne({ userId, topicId: attempt.topicId });

      if (!progress) {
        progress = await Progress.create({
          userId,
          topicId: attempt.topicId,
          lessonsCompleted: 0,
          quizzesCompleted: 1,
          accuracy: attempt.accuracy,
          masteryLevel: attempt.accuracy >= 80 ? 'Mastered' : 'In Progress',
        });
      } else {
        const prevQuizzes = progress.quizzesCompleted || 0;
        const newQuizzes = prevQuizzes + 1;
        const newAccuracy = Math.round(
          ((progress.accuracy * prevQuizzes) + attempt.accuracy) / newQuizzes
        );

        progress.quizzesCompleted = newQuizzes;
        progress.accuracy = newAccuracy;
        if (newAccuracy >= 80) {
          progress.masteryLevel = 'Mastered';
        } else if (progress.masteryLevel === 'Not Started') {
          progress.masteryLevel = 'In Progress';
        }
        progress.lastAccessedAt = new Date();
        await progress.save();
      }

      // Check and unlock badges
      newlyUnlockedBadges = await checkAndUnlockAchievements(userId, {
        completedQuiz: true,
        score100: attempt.accuracy === 100,
        fractionActivity: topic && topic.category === 'Fractions',
      });
    } else {
      // Record next question difficulty in progression
      attempt.difficultyProgression.push({
        questionIndex: attempt.currentQuestionIndex,
        difficulty: nextDifficulty,
      });
    }

    await attempt.save();

    if (isQuizComplete) {
      streakUpdate = await recordDailyActivity(userId, {
        activityType: 'quiz',
        activityId: attempt._id,
        timeZone: req.body.timeZone,
      });
      if (streakUpdate?.newlyUnlockedBadges?.length) {
        newlyUnlockedBadges = [...newlyUnlockedBadges, ...streakUpdate.newlyUnlockedBadges];
      }
    }

    // Prepare response
    const feedback = {
      isCorrect,
      selectedOptionIndex,
      correctOptionIndex: currentQuestion.correctOptionIndex,
      explanation: currentQuestion.explanation,
      earnedXP,
      currentDifficulty: attempt.currentDifficulty,
      streak: isCorrect ? attempt.consecutiveCorrect : 0,
    };

    if (isQuizComplete) {
      return res.status(200).json({
        success: true,
        isQuizComplete: true,
        feedback,
        summary: {
          attemptId: attempt._id,
          totalQuestions: attempt.totalQuestions,
          correctAnswers: attempt.correctAnswersCount,
          incorrectAnswers: attempt.incorrectAnswersCount,
          accuracy: attempt.accuracy,
          totalScore: attempt.score,
          earnedXP: attempt.earnedXP,
          difficultyProgression: attempt.difficultyProgression,
          completedAt: attempt.completedAt,
        },
        userLevelInfo,
        newlyUnlockedBadges,
        streakUpdate,
      });
    }

    // Return next question without answers
    const nextQ = attempt.questions[attempt.currentQuestionIndex];
    const sanitizedNextQuestion = {
      questionIndex: attempt.currentQuestionIndex,
      totalQuestions: attempt.totalQuestions,
      questionText: nextQ.questionText,
      options: nextQ.options,
      difficulty: attempt.currentDifficulty,
      points: POINTS_MAP[attempt.currentDifficulty],
    };

    return res.status(200).json({
      success: true,
      isQuizComplete: false,
      feedback,
      nextQuestion: sanitizedNextQuestion,
      currentDifficulty: attempt.currentDifficulty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get completed quiz attempt results
 * @route   GET /api/quizzes/:attemptId/result
 * @access  Private (Student)
 */
exports.getQuizResult = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await QuizAttempt.findById(attemptId).populate('topicId', 'title slug grade standardCode category');
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt not found.' });
    }

    if (attempt.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        topic: attempt.topicId,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswersCount,
        incorrectAnswers: attempt.incorrectAnswersCount,
        accuracy: attempt.accuracy,
        totalScore: attempt.score,
        earnedXP: attempt.earnedXP,
        difficultyProgression: attempt.difficultyProgression,
        answers: attempt.answers,
        status: attempt.status,
        completedAt: attempt.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's quiz history
 * @route   GET /api/quizzes/history
 * @access  Private (Student)
 */
exports.getQuizHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const history = await QuizAttempt.find({ userId, status: 'completed' })
      .populate('topicId', 'title slug grade standardCode category')
      .sort({ completedAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
