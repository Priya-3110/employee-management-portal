const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeProject = sequelize.define(
  'EmployeeProject',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    project_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: 'employee_projects',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'project_id'],
        name: 'employee_project_unique',
      },
    ],
  }
);

module.exports = EmployeeProject;
