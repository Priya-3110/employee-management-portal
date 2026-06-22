const { Employee, EmployeeProject, Project } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getActiveProjectCounts } = require('../utils/workloadUtils');

const normalizeIdList = (value) => {
  if (Array.isArray(value)) {
    return value.map(Number).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter(Boolean);
  }

  return value ? [Number(value)].filter(Boolean) : [];
};

const createAssignments = asyncHandler(async (req, res) => {
  const projectId = Number(req.body.project_id || req.body.projectId);
  const employeeIds = normalizeIdList(req.body.employee_ids || req.body.employeeIds || req.body.employee_id || req.body.employeeId);

  if (!projectId || !employeeIds.length) {
    throw new AppError('Project and at least one employee are required.', 400);
  }

  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  const employees = await Employee.findAll({ where: { id: employeeIds } });
  if (employees.length !== employeeIds.length) {
    throw new AppError('One or more selected employees do not exist.', 400);
  }

  const existingAssignments = await EmployeeProject.findAll({
    where: {
      project_id: projectId,
      employee_id: employeeIds,
    },
  });
  const existingEmployeeIds = new Set(existingAssignments.map((assignment) => assignment.employee_id));
  const payload = employeeIds
    .filter((employeeId) => !existingEmployeeIds.has(employeeId))
    .map((employeeId) => ({
      project_id: projectId,
      employee_id: employeeId,
    }));

  if (project.status === 'Active' && payload.length) {
    const newEmployeeIds = payload.map((item) => item.employee_id);
    const employeeMap = new Map(employees.map((employee) => [Number(employee.id), employee]));
    const activeCounts = await getActiveProjectCounts(newEmployeeIds);
    const blockedEmployees = newEmployeeIds
      .map((employeeId) => {
        const employee = employeeMap.get(Number(employeeId));
        const activeProjectsAfterAssignment = (activeCounts.get(Number(employeeId)) || 0) + 1;
        const maxProjects = Number(employee?.max_projects || 3);

        return activeProjectsAfterAssignment > maxProjects
          ? `${employee.full_name} (${activeProjectsAfterAssignment}/${maxProjects} active projects)`
          : null;
      })
      .filter(Boolean);

    if (blockedEmployees.length) {
      throw new AppError(`Assignment would overload: ${blockedEmployees.join(', ')}.`, 400);
    }
  }

  const createdAssignments = payload.length ? await EmployeeProject.bulkCreate(payload) : [];

  res.status(201).json({
    success: true,
    message: payload.length ? 'Employees assigned successfully.' : 'Selected employees were already assigned.',
    data: createdAssignments,
  });
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await EmployeeProject.findByPk(req.params.id);

  if (!assignment) {
    throw new AppError('Assignment not found.', 404);
  }

  await assignment.destroy();

  res.json({
    success: true,
    message: 'Assignment removed successfully.',
  });
});

const getAssignmentsByProject = asyncHandler(async (req, res) => {
  const assignments = await EmployeeProject.findAll({
    where: { project_id: req.params.projectId },
    include: [
      { model: Employee, as: 'employee' },
      { model: Project, as: 'project' },
    ],
    order: [['id', 'DESC']],
  });

  res.json({
    success: true,
    data: assignments,
  });
});

const getAssignmentsByEmployee = asyncHandler(async (req, res) => {
  const assignments = await EmployeeProject.findAll({
    where: { employee_id: req.params.employeeId },
    include: [
      { model: Employee, as: 'employee' },
      { model: Project, as: 'project' },
    ],
    order: [['id', 'DESC']],
  });

  res.json({
    success: true,
    data: assignments,
  });
});

module.exports = {
  createAssignments,
  deleteAssignment,
  getAssignmentsByProject,
  getAssignmentsByEmployee,
};
