const express = require('express');
const router = express.Router();
const {
  generateQuiz,
  startQuizSession,
  submitAnswer,
  getQuizResult,
  getQuizHistory,
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', generateQuiz);
router.post('/start', protect, startQuizSession);
router.post('/:attemptId/answer', protect, submitAnswer);
router.get('/history', protect, getQuizHistory);
router.get('/:attemptId/result', protect, getQuizResult);

module.exports = router;

