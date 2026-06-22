const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define(
  'Employee',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    skills: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    max_projects: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 3,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = Employee;
