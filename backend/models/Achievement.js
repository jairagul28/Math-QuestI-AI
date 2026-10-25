const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    badgeCode: {
      type: String,
      required: [true, 'Badge code is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Badge title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Badge description is required'],
    },
    icon: {
      type: String,
      default: 'Award',
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

achievementSchema.index({ userId: 1, badgeCode: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);

