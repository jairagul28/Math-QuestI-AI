const mongoose = require('mongoose');

const streakActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityDate: {
      type: String,
      required: true,
    },
    activityType: {
      type: String,
      enum: ['quiz', 'challenge'],
      required: true,
    },
    activityId: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    freezeUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

streakActivitySchema.index({ userId: 1, activityDate: 1 }, { unique: true });
streakActivitySchema.index({ userId: 1, activityId: 1 }, { unique: true });

module.exports = mongoose.model('StreakActivity', streakActivitySchema);
