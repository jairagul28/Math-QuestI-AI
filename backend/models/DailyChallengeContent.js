const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    expectedAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    standardCode: { type: String, default: '' },
    durationSeconds: { type: Number, default: 0 },
    rewardXP: { type: Number, required: true },
    questions: { type: [questionSchema], required: true },
  },
  { _id: false }
);

const dailyChallengeContentSchema = new mongoose.Schema(
  {
    challengeDate: { type: String, required: true },
    grade: { type: Number, enum: [5, 6], required: true },
    challenges: { type: [challengeSchema], required: true },
  },
  { timestamps: true }
);

dailyChallengeContentSchema.index({ challengeDate: 1, grade: 1 }, { unique: true });

module.exports = mongoose.model('DailyChallengeContent', dailyChallengeContentSchema);
