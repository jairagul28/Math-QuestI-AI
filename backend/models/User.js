const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Never return password hash in queries by default
    },
    grade: {
      type: Number,
      required: [true, 'Grade selection is required'],
      enum: {
        values: [5, 6],
        message: 'MathQuest AI currently supports Grade 5 and Grade 6',
      },
    },
    totalXP: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    xpAwardKeys: {
      type: [String],
      default: [],
      select: false,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    streakFreezes: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },
    streakLastActivityDate: {
      type: String,
      default: null,
    },
    streakTimezone: {
      type: String,
      default: null,
    },
    streakActivityDates: {
      type: [String],
      default: [],
    },
    streakFreezeMilestones: {
      type: [Number],
      default: [],
    },
    streakRewardMilestones: {
      type: [Number],
      default: [],
    },
    equippedAvatar: {
      type: String,
      default: 'fox',
    },
    equippedAccessory: {
      type: String,
      default: 'none',
    },
    unlockedAvatarIds: {
      type: [String],
      default: ['fox'],
    },
    unlockedAccessoryIds: {
      type: [String],
      default: ['none'],
    },
    weeklyXP: {
      type: Number,
      default: 0,
      min: 0,
    },
    weeklyXPWeek: {
      type: String,
      default: null,
    },
    leaderboardOptIn: {
      type: Boolean,
      default: false,
    },
    leaderboardNickname: {
      type: String,
      default: null,
      maxlength: 32,
    },
    classId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
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

userSchema.index({ leaderboardOptIn: 1, grade: 1, totalXP: -1 });
userSchema.index({ leaderboardOptIn: 1, grade: 1, weeklyXPWeek: 1, weeklyXP: -1 });

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Exclude passwordHash from JSON serialization
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.xpAwardKeys;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
