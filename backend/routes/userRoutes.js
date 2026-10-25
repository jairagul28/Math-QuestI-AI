const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAvatarRewards,
  equipAvatar,
  getLeaderboardSettings,
  updateLeaderboardSettings,
  getLeaderboard,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboard);
router.get('/avatars', protect, getAvatarRewards);
router.put('/avatar', protect, equipAvatar);
router.get('/leaderboard/settings', protect, getLeaderboardSettings);
router.put('/leaderboard/settings', protect, updateLeaderboardSettings);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
