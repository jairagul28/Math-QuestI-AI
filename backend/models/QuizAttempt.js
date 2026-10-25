const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic ID is required'],
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 5,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    currentDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    consecutiveCorrect: {
      type: Number,
      default: 0,
    },
    consecutiveIncorrect: {
      type: Number,
      default: 0,
    },
    difficultyProgression: [
      {
        questionIndex: Number,
        difficulty: String,
      },
    ],
    // Store question definitions for this session
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOptionIndex: { type: Number, required: true },
        explanation: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
        points: { type: Number, default: 20 },
      },
    ],
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOptionIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        difficulty: { type: String, required: true },
        earnedXP: { type: Number, required: true },
        explanation: { type: String },
        correctOptionIndex: { type: Number },
      },
    ],
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    correctAnswersCount: {
      type: Number,
      default: 0,
    },
    incorrectAnswersCount: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    earnedXP: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
      index: true,
    },
    completedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

quizAttemptSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
