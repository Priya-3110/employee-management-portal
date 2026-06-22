const sequelize = require('../config/database');
const User = require('./User');
const Employee = require('./Employee');
const Project = require('./Project');
const EmployeeProject = require('./EmployeeProject');

Employee.belongsToMany(Project, {
  through: EmployeeProject,
  foreignKey: 'employee_id',
  otherKey: 'project_id',
  as: 'projects',
  onDelete: 'CASCADE',
});

Project.belongsToMany(Employee, {
  through: EmployeeProject,
  foreignKey: 'project_id',
  otherKey: 'employee_id',
  as: 'employees',
  onDelete: 'CASCADE',
});

EmployeeProject.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee',
});

EmployeeProject.belongsTo(Project, {
  foreignKey: 'project_id',
  as: 'project',
});

Employee.hasMany(EmployeeProject, {
  foreignKey: 'employee_id',
  as: 'assignments',
});

Project.hasMany(EmployeeProject, {
  foreignKey: 'project_id',
  as: 'assignments',
});

module.exports = {
  sequelize,
  User,
  Employee,
  Project,
  EmployeeProject,
};
