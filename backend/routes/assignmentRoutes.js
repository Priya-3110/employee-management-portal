const express = require('express');
const {
  createAssignments,
  deleteAssignment,
  getAssignmentsByEmployee,
  getAssignmentsByProject,
} = require('../controllers/assignmentController');

const router = express.Router();

router.post('/', createAssignments);
router.delete('/:id', deleteAssignment);
router.get('/project/:projectId', getAssignmentsByProject);
router.get('/employee/:employeeId', getAssignmentsByEmployee);

module.exports = router;
