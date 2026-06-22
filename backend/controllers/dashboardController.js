const { fn, col } = require('sequelize');
const { Employee, Project } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { getActiveProjectCounts, getAvailabilityStatus } = require('../utils/workloadUtils');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const [totalEmployees, totalProjects, activeProjects, completedProjects, recentEmployees, recentProjects, statusRows, allEmployees] =
    await Promise.all([
      Employee.count(),
      Project.count(),
      Project.count({ where: { status: 'Active' } }),
      Project.count({ where: { status: 'Completed' } }),
      Employee.findAll({
        order: [['created_at', 'DESC']],
        limit: 5,
        attributes: ['id', 'full_name', 'email', 'designation', 'department', 'profile_image', 'created_at'],
      }),
      Project.findAll({
        order: [['created_at', 'DESC']],
        limit: 5,
        attributes: ['id', 'project_name', 'status', 'start_date', 'end_date', 'created_at'],
      }),
      Project.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      Employee.findAll({
        attributes: ['id', 'max_projects'],
      }),
    ]);

  const projectStatusStatistics = {
    Active: 0,
    Completed: 0,
    'On Hold': 0,
  };

  statusRows.forEach((row) => {
    projectStatusStatistics[row.status] = Number(row.count);
  });

  const activeCounts = await getActiveProjectCounts(allEmployees.map((employee) => employee.id));
  const workloadDistribution = {
    Available: 0,
    Busy: 0,
    Overloaded: 0,
  };

  allEmployees.forEach((employee) => {
    const activeProjectCount = activeCounts.get(Number(employee.id)) || 0;
    const status = getAvailabilityStatus(activeProjectCount, Number(employee.max_projects || 3));
    workloadDistribution[status] += 1;
  });

  res.json({
    success: true,
    data: {
      cards: {
        totalEmployees,
        totalProjects,
        activeProjects,
        completedProjects,
        availableEmployees: workloadDistribution.Available,
        busyEmployees: workloadDistribution.Busy,
        overloadedEmployees: workloadDistribution.Overloaded,
      },
      recentEmployees,
      recentProjects,
      projectStatusStatistics,
      workloadDistribution: Object.entries(workloadDistribution).map(([status, count]) => ({
        status,
        count,
      })),
    },
  });
});

module.exports = {
  getDashboardSummary,
};
