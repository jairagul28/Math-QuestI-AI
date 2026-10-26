const mongoose = require('mongoose');

const workedExampleSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    steps: [{ type: String, required: true }],
    answer: { type: String, required: true },
  },
  { _id: false }
);

const videoSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    content: [{ type: String, required: true }],
    narration: { type: String, required: true },
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic ID reference is required'],
      index: true,
    },
    grade: {
      type: Number,
      required: [true, 'Grade is required'],
      enum: [5, 6],
      index: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    introduction: {
      type: String,
      default: '',
    },
    explanation: {
      type: String,
      required: [true, 'Lesson explanation is required'],
    },
    keyConcepts: [
      {
        type: String,
      },
    ],
    workedExamples: [workedExampleSchema],
    realWorldApplication: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    practiceTips: [
      {
        type: String,
      },
    ],
    videoSlides: {
      type: [videoSlideSchema],
      default: [],
    },
    contentVersion: {
      type: Number,
      default: 0,
    },
    infographicUrl: {
      type: String,
      default: '',
    },
    isAIGenerated: {
      type: Boolean,
      default: true,
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.index({ topicId: 1, grade: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
