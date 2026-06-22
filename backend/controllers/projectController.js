const { Op } = require('sequelize');
const { Project, Employee } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  calculateRecommendation,
  getActiveProjectCounts,
  parseSkills,
} = require('../utils/workloadUtils');

const statusOptions = ['Active', 'Completed', 'On Hold'];

const normalizeProjectPayload = (body) => ({
  project_name: body.project_name?.trim(),
  description: body.description?.trim() || null,
  start_date: body.start_date,
  end_date: body.end_date,
  status: body.status,
  required_skills: parseSkills(body.required_skills ?? body.requiredSkills),
  project_role: (body.project_role || body.projectRole || '').trim() || null,
});

const validateProject = (payload, partial = false) => {
  const requiredFields = ['project_name', 'start_date', 'end_date', 'status'];

  if (!partial) {
    const missing = requiredFields.filter((field) => !payload[field]);
    if (missing.length) {
      throw new AppError(`Missing required fields: ${missing.join(', ')}.`, 400);
    }
  }

  if (payload.status && !statusOptions.includes(payload.status)) {
    throw new AppError('Project status must be Active, Completed, or On Hold.', 400);
  }

  if (payload.start_date && payload.end_date && new Date(payload.end_date) < new Date(payload.start_date)) {
    throw new AppError('End date cannot be before the start date.', 400);
  }
};

const buildPagination = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const getProjects = asyncHandler(async (req, res) => {
  const { search = '', status = '' } = req.query;
  const { page, limit, offset } = buildPagination(req.query);
  const where = {};

  if (search) {
    where[Op.or] = [
      { project_name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status && statusOptions.includes(status)) {
    where.status = status;
  }

  const { rows, count } = await Project.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true,
  });

  res.json({
    success: true,
    data: rows,
    meta: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit) || 1,
    },
  });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: [
      {
        model: Employee,
        as: 'employees',
        through: { attributes: ['id'] },
      },
    ],
  });

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  res.json({
    success: true,
    data: project,
  });
});

const recommendEmployeesForProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.projectId, {
    include: [
      {
        model: Employee,
        as: 'employees',
        through: { attributes: ['id'] },
      },
    ],
  });

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  const employees = await Employee.findAll({
    order: [['full_name', 'ASC']],
  });
  const activeCounts = await getActiveProjectCounts(employees.map((employee) => employee.id));
  const assignedEmployeeIds = new Set((project.employees || []).map((employee) => Number(employee.id)));
  const recommendations = employees
    .map((employee) =>
      calculateRecommendation({
        employee,
        project,
        activeProjects: activeCounts.get(Number(employee.id)) || 0,
        alreadyAssigned: assignedEmployeeIds.has(Number(employee.id)),
      })
    )
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchedSkills !== a.matchedSkills) return b.matchedSkills - a.matchedSkills;
      return a.name.localeCompare(b.name);
    });

  res.json({
    success: true,
    data: recommendations,
  });
});

const createProject = asyncHandler(async (req, res) => {
  const payload = normalizeProjectPayload(req.body);
  validateProject(payload);

  const project = await Project.create(payload);

  res.status(201).json({
    success: true,
    message: 'Project created successfully.',
    data: project,
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  const payload = normalizeProjectPayload(req.body);
  validateProject(payload, true);

  await project.update(payload);

  res.json({
    success: true,
    message: 'Project updated successfully.',
    data: project,
  });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  await project.destroy();

  res.json({
    success: true,
    message: 'Project deleted successfully.',
  });
});

module.exports = {
  getProjects,
  getProjectById,
  recommendEmployeesForProject,
  createProject,
  updateProject,
  deleteProject,
};
