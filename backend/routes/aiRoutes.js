const express = require('express');
const router = express.Router();
const { generateLesson, completeLesson } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-lesson', generateLesson);
router.post('/complete-lesson', protect, completeLesson);

module.exports = router;

