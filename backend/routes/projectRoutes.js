const express = require('express');
const {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  recommendEmployeesForProject,
  updateProject,
} = require('../controllers/projectController');

const router = express.Router();

router.route('/').get(getProjects).post(createProject);
router.get('/recommend/:projectId', recommendEmployeesForProject);
router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);

module.exports = router;
