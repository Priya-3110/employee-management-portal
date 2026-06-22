const express = require('express');
const {
  createEmployee,
  deleteEmployee,
  getEmployeeAvailability,
  getEmployeeById,
  getEmployees,
  updateEmployee,
} = require('../controllers/employeeController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/').get(getEmployees).post(upload.single('profile_image'), createEmployee);
router.get('/availability', getEmployeeAvailability);
router
  .route('/:id')
  .get(getEmployeeById)
  .put(upload.single('profile_image'), updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
