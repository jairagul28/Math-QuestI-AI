const express = require('express');
const router = express.Router();
const { getTopics, getTopicById } = require('../controllers/topicController');

router.get('/', getTopics);
router.get('/:id', getTopicById);

module.exports = router;

