const { Op } = require('sequelize');
const { Employee, Project } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { removeUploadedFile } = require('../utils/fileUtils');
const {
  enrichEmployeesWithAvailability,
  getActiveProjectCounts,
  getAvailabilityStatus,
  getWorkloadPercentage,
  serializeEmployeeWithAvailability,
} = require('../utils/workloadUtils');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const getProfileImagePath = (file) => (file ? `/uploads/${file.filename}` : undefined);

const normalizeEmployeePayload = (body, file) => ({
  full_name: body.full_name?.trim(),
  email: body.email?.trim().toLowerCase(),
  phone: body.phone?.trim(),
  designation: body.designation?.trim(),
  department: body.department?.trim(),
  joining_date: body.joining_date,
  skills: body.skills?.trim() || null,
  max_projects: body.max_projects ? Number(body.max_projects) : 3,
  ...(file ? { profile_image: getProfileImagePath(file) } : {}),
});

const validateEmployee = (payload, partial = false) => {
  const requiredFields = ['full_name', 'email', 'phone', 'designation', 'department', 'joining_date'];

  if (!partial) {
    const missing = requiredFields.filter((field) => !payload[field]);
    if (missing.length) {
      throw new AppError(`Missing required fields: ${missing.join(', ')}.`, 400);
    }
  }

  if (payload.email && !emailRegex.test(payload.email)) {
    throw new AppError('A valid employee email is required.', 400);
  }

  if (payload.phone && !phoneRegex.test(payload.phone)) {
    throw new AppError('A valid phone number is required.', 400);
  }

  if (payload.max_projects && (!Number.isInteger(payload.max_projects) || payload.max_projects < 1)) {
    throw new AppError('Maximum projects must be a positive whole number.', 400);
  }
};

const buildPagination = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const getEmployees = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const { page, limit, offset } = buildPagination(req.query);

  const where = search
    ? {
        [Op.or]: [
          { full_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { designation: { [Op.like]: `%${search}%` } },
          { department: { [Op.like]: `%${search}%` } },
        ],
      }
    : undefined;

  const { rows, count } = await Employee.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  const employeesWithAvailability = await enrichEmployeesWithAvailability(rows);

  res.json({
    success: true,
    data: employeesWithAvailability,
    meta: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit) || 1,
    },
  });
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findByPk(req.params.id, {
    include: [
      {
        model: Project,
        as: 'projects',
        through: { attributes: ['id'] },
      },
    ],
  });

  if (!employee) {
    throw new AppError('Employee not found.', 404);
  }

  const activeCounts = await getActiveProjectCounts([employee.id]);
  const employeeWithAvailability = serializeEmployeeWithAvailability(employee, activeCounts.get(Number(employee.id)) || 0);

  res.json({
    success: true,
    data: employeeWithAvailability,
  });
});

const getEmployeeAvailability = asyncHandler(async (req, res) => {
  const employees = await Employee.findAll({
    order: [['full_name', 'ASC']],
    attributes: ['id', 'full_name', 'max_projects'],
  });
  const activeCounts = await getActiveProjectCounts(employees.map((employee) => employee.id));

  const availability = employees.map((employee) => {
    const activeProjects = activeCounts.get(Number(employee.id)) || 0;
    const maxProjects = Number(employee.max_projects || 3);

    return {
      id: employee.id,
      name: employee.full_name,
      activeProjects,
      maxProjects,
      status: getAvailabilityStatus(activeProjects, maxProjects),
      workloadPercentage: getWorkloadPercentage(activeProjects, maxProjects),
    };
  });

  res.json({
    success: true,
    data: availability,
  });
});

const createEmployee = asyncHandler(async (req, res) => {
  const payload = normalizeEmployeePayload(req.body, req.file);
  validateEmployee(payload);

  const exists = await Employee.findOne({ where: { email: payload.email } });
  if (exists) {
    removeUploadedFile(payload.profile_image);
    throw new AppError('Employee email must be unique.', 409);
  }

  const employee = await Employee.create(payload);

  res.status(201).json({
    success: true,
    message: 'Employee created successfully.',
    data: employee,
  });
});

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    throw new AppError('Employee not found.', 404);
  }

  const payload = normalizeEmployeePayload(req.body, req.file);
  validateEmployee(payload, true);

  if (payload.email) {
    const exists = await Employee.findOne({
      where: {
        email: payload.email,
        id: { [Op.ne]: employee.id },
      },
    });

    if (exists) {
      removeUploadedFile(payload.profile_image);
      throw new AppError('Employee email must be unique.', 409);
    }
  }

  const oldImage = employee.profile_image;
  await employee.update(payload);

  if (payload.profile_image && oldImage) {
    removeUploadedFile(oldImage);
  }

  res.json({
    success: true,
    message: 'Employee updated successfully.',
    data: employee,
  });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);

  if (!employee) {
    throw new AppError('Employee not found.', 404);
  }

  const imagePath = employee.profile_image;
  await employee.destroy();
  removeUploadedFile(imagePath);

  res.json({
    success: true,
    message: 'Employee deleted successfully.',
  });
});

module.exports = {
  getEmployees,
  getEmployeeById,
  getEmployeeAvailability,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
