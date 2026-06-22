const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define(
  'Project',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    project_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Completed', 'On Hold'),
      allowNull: false,
      defaultValue: 'Active',
    },
    required_skills: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('required_skills');
        if (!value) return [];

        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          return value
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean);
        }
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('required_skills', JSON.stringify(value.filter(Boolean)));
          return;
        }

        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (!trimmed) {
            this.setDataValue('required_skills', null);
            return;
          }

          try {
            const parsed = JSON.parse(trimmed);
            this.setDataValue('required_skills', JSON.stringify(Array.isArray(parsed) ? parsed : []));
          } catch (error) {
            this.setDataValue(
              'required_skills',
              JSON.stringify(
                trimmed
                  .split(',')
                  .map((skill) => skill.trim())
                  .filter(Boolean)
              )
            );
          }
          return;
        }

        this.setDataValue('required_skills', null);
      },
    },
    project_role: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: 'projects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = Project;
