const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getDailyChallenges,
  submitDailyChallengeAnswer,
} = require('../controllers/challengeController');

const router = express.Router();
router.get('/daily', protect, getDailyChallenges);
router.post('/daily/:challengeCode/answer', protect, submitDailyChallengeAnswer);

module.exports = router;
