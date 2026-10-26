const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const groqService = require('../services/groqService');
const { lessonGenerationSchema } = require('../utils/schemas');
const { validateArithmetic, getFallbackLesson } = require('../utils/mathValidator');
const {
  VIDEO_LESSON_CONTENT_VERSION,
  createVideoSlides,
  hasValidVideoSlides,
} = require('../services/videoLessonService');
const { awardXP, checkAndUnlockAchievements } = require('../services/gamificationService');

/**
 * @desc    Generate or retrieve an AI-powered lesson aligned with Georgia Standards
 * @route   POST /api/ai/generate-lesson
 * @access  Public / Authenticated
 */
exports.generateLesson = async (req, res, next) => {
  try {
    const {
      grade,
      topicId,
      topicTitle,
      standardCode,
      standardDescription,
      forceRefresh,
    } = req.body;

    if (!grade || !topicId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both grade (5 or 6) and topicId.',
      });
    }

    const parsedGrade = parseInt(grade, 10);
    if (![5, 6].includes(parsedGrade)) {
      return res.status(400).json({
        success: false,
        message: 'Grade must be either 5 or 6.',
      });
    }

    // 1. Retrieve topic and curriculum metadata from MongoDB
    let topic;
    if (mongoose.Types.ObjectId.isValid(topicId)) {
      topic = await Topic.findById(topicId);
    }
    if (!topic) {
      topic = await Topic.findOne({ slug: topicId });
    }

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: `Topic with id '${topicId}' was not found.`,
      });
    }

    // Validate grade-topic alignment
    if (topic.grade !== parsedGrade) {
      return res.status(400).json({
        success: false,
        message: `Topic '${topic.title}' belongs to Grade ${topic.grade}, not Grade ${parsedGrade}.`,
      });
    }

    if (
      (topicTitle && topicTitle !== topic.title)
      || (standardCode && standardCode !== topic.standardCode)
      || (standardDescription && standardDescription !== topic.standardDescription)
    ) {
      return res.status(409).json({
        success: false,
        message: 'Topic curriculum metadata changed. Reload the topic and try again.',
      });
    }

    // 2. Check MongoDB cache first to reduce unnecessary Groq calls
    if (!forceRefresh) {
      const cachedLesson = await Lesson.findOne({ topicId: topic._id, grade: parsedGrade });
      if (
        cachedLesson
        && cachedLesson.contentVersion === VIDEO_LESSON_CONTENT_VERSION
        && hasValidVideoSlides(cachedLesson.videoSlides)
      ) {
        return res.status(200).json({
          success: true,
          cached: true,
          data: cachedLesson,
        });
      }
    }

    // 3. Construct Georgia Standards grade-appropriate prompt for Groq
    const prompt = `You are a certified Georgia elementary and middle school mathematics curriculum specialist.
Generate a structured, mathematically accurate lesson for a Grade ${parsedGrade} student.

TOPIC: ${topic.title}
GEORGIA MATHEMATICS STANDARD: ${topic.standardCode} - ${topic.standardDescription}
CATEGORY: ${topic.category}
TARGET AUDIENCE: Grade ${parsedGrade} students (friendly, encouraging, clear pedagogical language).

You MUST respond strictly with a valid JSON object matching this exact schema:
{
  "title": "${topic.title}",
  "grade": ${parsedGrade},
  "topic": "${topic.category}",
  "introduction": "Engaging child-friendly introduction explaining why this concept matters (3-4 sentences)",
  "explanation": "Clear, detailed step-by-step mathematical explanation using analogies, visual hints, and accurate definitions",
  "keyConcepts": [
    "Core concept 1 with definition",
    "Core concept 2 with formula or rule",
    "Core concept 3 with common pitfall to avoid"
  ],
  "workedExamples": [
    {
      "question": "Realistic practice problem statement",
      "steps": [
        "Step 1: Identify given quantities",
        "Step 2: Carry out standard mathematical procedure",
        "Step 3: Simplify or verify the result"
      ],
      "answer": "Final exact answer with units or fraction form"
    },
    {
      "question": "Second problem statement exploring a variation",
      "steps": [
        "Step 1: Setup",
        "Step 2: Calculation",
        "Step 3: Check answer"
      ],
      "answer": "Exact answer"
    }
  ],
  "realWorldApplication": "Vivid real-life example showing how astronauts, chefs, architects, or video game designers use this math",
  "summary": "Brief 2-3 sentence wrap up summarizing the big idea",
  "practiceTips": [
    "Tip 1 for solving similar problems",
    "Tip 2 for checking your work"
  ]
}

DO NOT wrap in Markdown code blocks. Output ONLY raw parseable JSON.`;

    let lessonData = null;
    let isFallback = false;

    // 4. Call Groq with retries (up to 2 attempts)
    if (groqService.isConfigured()) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const rawResponse = await groqService.generateCompletion({
            messages: [
              {
                role: 'system',
                content: 'You are an educational AI assistant that outputs strictly valid JSON for Georgia Mathematics Standards lessons. Never hallucinate calculations.',
              },
              { role: 'user', content: prompt },
            ],
            jsonMode: true,
            temperature: 0.2,
            maxTokens: 2000,
          });

          // Parse JSON if needed
          let parsed;
          if (typeof rawResponse === 'object') {
            parsed = rawResponse;
          } else {
            parsed = JSON.parse(rawResponse);
          }

          // Validate with Zod
          const validationResult = lessonGenerationSchema.safeParse(parsed);
          if (validationResult.success) {
            lessonData = validationResult.data;

            // Mathematical arithmetic checks
            let allMathValid = true;
            for (const eg of lessonData.workedExamples) {
              const check = validateArithmetic(eg.question, eg.answer);
              if (!check.isValid) {
                console.warn(`[Lesson Math Check Warn]: ${check.reason}`);
              }
            }

            break; // Success!
          } else {
            console.warn(`[AI Controller] Zod validation attempt ${attempt} failed:`, validationResult.error.issues);
          }
        } catch (err) {
          console.warn(`[AI Controller] Groq call attempt ${attempt} failed: ${err.message}`);
        }
      }
    }

    // 5. Fallback if Groq failed or is not configured
    if (!lessonData) {
      console.log(`[AI Controller] Utilizing verified Georgia Standards fallback for '${topic.slug}'`);
      lessonData = getFallbackLesson(topic.slug, topic);
      if (!lessonData) {
        return res.status(503).json({
          success: false,
          message: 'Video lesson for this topic is temporarily unavailable. Please try again.',
        });
      }
      isFallback = true;
    }

    // Attach infographic URL for fractions
    const infographicUrl = topic.category === 'Fractions' || topic.slug.includes('fraction')
      ? '/infographics/equivalent-fractions-infographic.png'
      : '';
    const videoSlides = createVideoSlides(lessonData, topic);

    // 6. Save or update lesson in MongoDB
    const savedLesson = await Lesson.findOneAndUpdate(
      { topicId: topic._id, grade: parsedGrade },
      {
        topicId: topic._id,
        grade: parsedGrade,
        topic: topic.category,
        title: lessonData.title,
        introduction: lessonData.introduction,
        explanation: lessonData.explanation,
        keyConcepts: lessonData.keyConcepts,
        workedExamples: lessonData.workedExamples,
        realWorldApplication: lessonData.realWorldApplication,
        summary: lessonData.summary,
        practiceTips: lessonData.practiceTips,
        videoSlides,
        contentVersion: VIDEO_LESSON_CONTENT_VERSION,
        infographicUrl: lessonData.infographicUrl || infographicUrl,
        isAIGenerated: !isFallback,
        isFallback,
        verified: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      cached: false,
      isFallback,
      data: savedLesson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a lesson as completed, award XP, update progress and check badges
 * @route   POST /api/ai/complete-lesson
 * @access  Private (Student)
 */
exports.completeLesson = async (req, res, next) => {
  try {
    const { topicId } = req.body;
    const userId = req.user._id;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: 'Topic ID is required.',
      });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found.',
      });
    }

    // Fetch or create student Progress record
    let progress = await Progress.findOne({ userId, topicId: topic._id });
    const isFirstCompletion = !progress || progress.lessonsCompleted === 0;

    if (!progress) {
      progress = await Progress.create({
        userId,
        topicId: topic._id,
        lessonsCompleted: 1,
        quizzesCompleted: 0,
        accuracy: 0,
        masteryLevel: 'In Progress',
      });
    } else {
      progress.lessonsCompleted = (progress.lessonsCompleted || 0) + 1;
      if (progress.masteryLevel === 'Not Started') {
        progress.masteryLevel = 'In Progress';
      }
      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    // Award XP only for first verified lesson completion (15 XP) per section 4.1
    let xpAward = null;
    let earnedXP = 0;
    if (isFirstCompletion) {
      earnedXP = 15;
      xpAward = await awardXP(userId, earnedXP, `lesson:${topic._id}`);
    }

    // Evaluate badges
    const newlyUnlockedBadges = await checkAndUnlockAchievements(userId, {
      completedLesson: true,
      fractionActivity: topic.category === 'Fractions',
    });

    return res.status(200).json({
      success: true,
      message: isFirstCompletion ? 'Lesson completed! +15 XP earned!' : 'Lesson reviewed!',
      earnedXP,
      isFirstCompletion,
      userLevelInfo: xpAward,
      newlyUnlockedBadges,
      progress: {
        lessonsCompleted: progress.lessonsCompleted,
        quizzesCompleted: progress.quizzesCompleted,
        masteryLevel: progress.masteryLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};
