const mongoose = require('mongoose');
const Topic = require('../models/Topic');

// @desc    Get all topics (optionally filtered by grade)
// @route   GET /api/topics
// @access  Public
exports.getTopics = async (req, res, next) => {
  try {
    const { grade, category } = req.query;
    const filter = {};

    if (grade) {
      const parsedGrade = parseInt(grade, 10);
      if ([5, 6].includes(parsedGrade)) {
        filter.grade = parsedGrade;
      }
    }

    if (category) {
      filter.category = category;
    }

    const topics = await Topic.find(filter).sort({ grade: 1, order: 1 });

    return res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single topic by ID or Slug
// @route   GET /api/topics/:id
// @access  Public
exports.getTopicById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let topic;

    if (mongoose.Types.ObjectId.isValid(id)) {
      topic = await Topic.findById(id);
    }

    if (!topic) {
      // Try finding by slug
      topic = await Topic.findOne({ slug: id.toLowerCase() });
    }

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: `Topic not found with identifier: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    next(error);
  }
};

