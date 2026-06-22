const express = require('express');
const {
  getAvailability,
  getProjectRecommendations,
} = require('../controllers/recommendationController');

const router = express.Router();

router.get('/availability', getAvailability);
router.get('/project/:projectId', getProjectRecommendations);

module.exports = router;
