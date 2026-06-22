const { Employee, Project } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { buildAvailability, calculateRecommendation, getActiveProjectCounts } = require('../utils/workloadUtils');

/**
 * Get detailed availability and workload status for all employees.
 * GET /api/recommendations/availability
 */
const getAvailability = asyncHandler(async (req, res) => {
  const employees = await Employee.findAll({
    include: [
      {
        model: Project,
        as: 'projects',
        through: { attributes: [] },
      },
    ],
    order: [['full_name', 'ASC']],
  });

  const availabilityData = employees.map((employee) => {
    const plainEmployee = employee.get({ plain: true });
    const activeProjects = plainEmployee.projects.filter((p) => p.status === 'Active');
    const activeProjectCount = activeProjects.length;
    const availability = buildAvailability(plainEmployee, activeProjectCount);

    return {
      id: plainEmployee.id,
      full_name: plainEmployee.full_name,
      email: plainEmployee.email,
      phone: plainEmployee.phone,
      designation: plainEmployee.designation,
      department: plainEmployee.department,
      joining_date: plainEmployee.joining_date,
      profile_image: plainEmployee.profile_image,
      skills: plainEmployee.skills,
      max_projects: plainEmployee.max_projects,
      activeProjects: activeProjects.map((p) => ({
        id: p.id,
        project_name: p.project_name,
        status: p.status,
        start_date: p.start_date,
        end_date: p.end_date,
      })),
      availability,
    };
  });

  res.json({
    success: true,
    data: availabilityData,
  });
});

/**
 * Get sorted recommendations of employees for a specific project.
 * GET /api/recommendations/project/:projectId
 */
const getProjectRecommendations = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findByPk(projectId, {
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

  const recommendations = employees.map((employee) => {
    const activeProjects = activeCounts.get(Number(employee.id)) || 0;
    const alreadyAssigned = assignedEmployeeIds.has(Number(employee.id));

    const rec = calculateRecommendation({
      employee,
      project,
      activeProjects,
      alreadyAssigned,
    });

    return rec;
  });

  // Sort: highest recommendation score first, then matching skills, then alphabetically by name.
  recommendations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.matchedSkills !== a.matchedSkills) return b.matchedSkills - a.matchedSkills;
    return a.name.localeCompare(b.name);
  });

  res.json({
    success: true,
    data: recommendations,
  });
});

module.exports = {
  getAvailability,
  getProjectRecommendations,
};
