const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Topic slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    grade: {
      type: Number,
      required: [true, 'Grade is required'],
      enum: [5, 6],
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Fractions', 'Decimals', 'Ratios & Proportions', 'Geometry', 'Algebraic Thinking'],
    },
    description: {
      type: String,
      required: [true, 'Topic description is required'],
    },
    standardCode: {
      type: String,
      required: [true, 'Georgia Mathematics Standard code is required'],
      trim: true,
    },
    standardDescription: {
      type: String,
      required: [true, 'Georgia Standard description is required'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    order: {
      type: Number,
      default: 1,
    },
    estimatedMinutes: {
      type: Number,
      default: 15,
    },
    icon: {
      type: String,
      default: 'BookOpen',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup by grade and slug
topicSchema.index({ grade: 1, order: 1 });

module.exports = mongoose.model('Topic', topicSchema);

