const mongoose = require('mongoose');

const dailyChallengeProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    challengeDate: {
      type: String,
      required: true,
    },
    challengeCode: {
      type: String,
      required: true,
    },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOptionIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
    expired: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

dailyChallengeProgressSchema.index(
  { userId: 1, challengeDate: 1, challengeCode: 1 },
  { unique: true }
);

module.exports = mongoose.model('DailyChallengeProgress', dailyChallengeProgressSchema);
