const { Op } = require('sequelize');
const { EmployeeProject, Project } = require('../models');

const parseSkills = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((skill) => String(skill).trim()).filter(Boolean);
  }

  const text = String(value).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((skill) => String(skill).trim()).filter(Boolean);
    }
  } catch (error) {
    // Fall back to comma-separated skills.
  }

  return text
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const normalizeSkill = (skill) => String(skill).trim().toLowerCase();

const getAvailabilityStatus = (activeProjects, maxProjects = 3) => {
  if (activeProjects <= 1) return 'Available';
  if (activeProjects <= maxProjects) return 'Busy';
  return 'Overloaded';
};

const getWorkloadPercentage = (activeProjects, maxProjects = 3) => {
  if (!maxProjects || maxProjects < 1) return 0;
  return Math.min(Math.round((activeProjects / maxProjects) * 100), 999);
};

const getActiveProjectCounts = async (employeeIds) => {
  const ids = [...new Set(employeeIds.map(Number).filter(Boolean))];
  const counts = new Map(ids.map((id) => [id, 0]));

  if (!ids.length) return counts;

  const activeAssignments = await EmployeeProject.findAll({
    where: {
      employee_id: { [Op.in]: ids },
    },
    include: [
      {
        model: Project,
        as: 'project',
        attributes: ['id', 'status'],
        where: { status: 'Active' },
        required: true,
      },
    ],
    attributes: ['employee_id'],
  });

  activeAssignments.forEach((assignment) => {
    const employeeId = Number(assignment.employee_id);
    counts.set(employeeId, (counts.get(employeeId) || 0) + 1);
  });

  return counts;
};

const buildAvailability = (employee, activeProjects) => {
  const maxProjects = Number(employee.max_projects || 3);

  return {
    activeProjects,
    maxProjects,
    status: getAvailabilityStatus(activeProjects, maxProjects),
    workloadPercentage: getWorkloadPercentage(activeProjects, maxProjects),
  };
};

const serializeEmployeeWithAvailability = (employee, activeProjects) => {
  const plainEmployee = typeof employee.toJSON === 'function' ? employee.toJSON() : employee;

  return {
    ...plainEmployee,
    availability: buildAvailability(plainEmployee, activeProjects),
  };
};

const enrichEmployeesWithAvailability = async (employees) => {
  const activeCounts = await getActiveProjectCounts(employees.map((employee) => employee.id));

  return employees.map((employee) => serializeEmployeeWithAvailability(employee, activeCounts.get(Number(employee.id)) || 0));
};

const isDesignationMatch = (designation, projectRole) => {
  if (!designation || !projectRole) return false;

  const normalizedDesignation = String(designation).trim().toLowerCase();
  const normalizedRole = String(projectRole).trim().toLowerCase();

  return (
    normalizedDesignation === normalizedRole ||
    normalizedDesignation.includes(normalizedRole) ||
    normalizedRole.includes(normalizedDesignation)
  );
};

const calculateRecommendation = ({ employee, project, activeProjects = 0, alreadyAssigned = false }) => {
  const requiredSkills = parseSkills(project.required_skills);
  const employeeSkills = parseSkills(employee.skills);
  const employeeSkillSet = new Set(employeeSkills.map(normalizeSkill));
  const matchingSkills = requiredSkills.filter((skill) => employeeSkillSet.has(normalizeSkill(skill)));
  const availability = buildAvailability(employee, activeProjects);
  let score = matchingSkills.length * 10;

  if (isDesignationMatch(employee.designation, project.project_role)) {
    score += 5;
  }

  if (availability.status === 'Available') {
    score += 10;
  }

  if (availability.status === 'Overloaded') {
    score -= 10;
  }

  const maxPossibleScore = Math.max(requiredSkills.length * 10 + 15, 1);

  return {
    employeeId: employee.id,
    name: employee.full_name,
    score,
    matchPercentage: Math.max(0, Math.min(Math.round((score / maxPossibleScore) * 100), 100)),
    status: availability.status,
    matchedSkills: matchingSkills.length,
    matchingSkills,
    activeProjects,
    maxProjects: availability.maxProjects,
    designation: employee.designation,
    alreadyAssigned,
  };
};

module.exports = {
  buildAvailability,
  calculateRecommendation,
  enrichEmployeesWithAvailability,
  getActiveProjectCounts,
  getAvailabilityStatus,
  getWorkloadPercentage,
  parseSkills,
  serializeEmployeeWithAvailability,
};
