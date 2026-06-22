USE employee_project_portal;

ALTER TABLE employees
  ADD COLUMN skills VARCHAR(255) NULL,
  ADD COLUMN max_projects INT UNSIGNED NOT NULL DEFAULT 3;

ALTER TABLE projects
  ADD COLUMN required_skills TEXT NULL,
  ADD COLUMN project_role VARCHAR(100) NULL;
