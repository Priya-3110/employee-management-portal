CREATE DATABASE IF NOT EXISTS employee_project_portal;
USE employee_project_portal;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  joining_date DATE NOT NULL,
  profile_image VARCHAR(255) NULL,
  skills VARCHAR(255) NULL,
  max_projects INT UNSIGNED NOT NULL DEFAULT 3,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('Active', 'Completed', 'On Hold') NOT NULL DEFAULT 'Active',
  required_skills TEXT NULL,
  project_role VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNSIGNED NOT NULL,
  project_id INT UNSIGNED NOT NULL,
  CONSTRAINT employee_project_unique UNIQUE (employee_id, project_id),
  CONSTRAINT fk_employee_projects_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_employee_projects_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_employees_search ON employees(full_name, email, department);
CREATE INDEX idx_projects_status ON projects(status);
