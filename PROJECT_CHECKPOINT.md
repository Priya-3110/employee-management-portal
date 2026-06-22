# Project Checkpoint

This file documents the status of the project before the addition of the smart employee recommendation and resource availability tracking features.

## 1. Current Working Features

1. **User Authentication**:
   - Secure login using JSON Web Tokens (JWT) for admin access.
   - Front-end auth state management using React Context (`AuthContext`).
   - Secure routing using `<ProtectedRoute>` component.
2. **Employee Management**:
   - CRUD (Create, Read, Update, Delete) capabilities.
   - Profile photo uploads using Multer on the backend.
   - Tracks details: full name, email, phone number, designation, department, joining date, skills (comma-separated tags), and max projects capacity (default is 3).
3. **Project Management**:
   - CRUD (Create, Read, Update, Delete) capabilities.
   - Tracks details: name, description, start/end dates, status (Active, Completed, On Hold), required skills, and target project role.
4. **Employee Assignment**:
   - Assign/remove multiple employees to/from a selected project.
   - Validates workload limits before assigning employees (overload check prevents assigning if it exceeds their max capacity when the project is active).

---

## 2. Current Database Schema

The database consists of 4 main tables:

### `users`
- `id` (INT UNSIGNED, PK, Auto Increment)
- `email` (VARCHAR(120), Unique, Not Null)
- `password` (VARCHAR(255), Not Null)
- `role` (VARCHAR(40), Default 'admin', Not Null)
- `created_at` (DATETIME, Default CURRENT_TIMESTAMP)

### `employees`
- `id` (INT UNSIGNED, PK, Auto Increment)
- `full_name` (VARCHAR(120), Not Null)
- `email` (VARCHAR(120), Unique, Not Null)
- `phone` (VARCHAR(30), Not Null)
- `designation` (VARCHAR(100), Not Null)
- `department` (VARCHAR(100), Not Null)
- `joining_date` (DATE, Not Null)
- `profile_image` (VARCHAR(255), Null)
- `skills` (VARCHAR(255), Null)
- `max_projects` (INT UNSIGNED, Default 3, Not Null)
- `created_at` (DATETIME, Default CURRENT_TIMESTAMP)

### `projects`
- `id` (INT UNSIGNED, PK, Auto Increment)
- `project_name` (VARCHAR(150), Not Null)
- `description` (TEXT, Null)
- `start_date` (DATE, Not Null)
- `end_date` (DATE, Not Null)
- `status` (ENUM('Active', 'Completed', 'On Hold'), Default 'Active', Not Null)
- `required_skills` (TEXT, Null)
- `project_role` (VARCHAR(100), Null)
- `created_at` (DATETIME, Default CURRENT_TIMESTAMP)

### `employee_projects` (Many-to-Many Join Table)
- `id` (INT UNSIGNED, PK, Auto Increment)
- `employee_id` (INT UNSIGNED, FK to `employees.id`, CASCADE on delete)
- `project_id` (INT UNSIGNED, FK to `projects.id`, CASCADE on delete)
- *Constraint*: UNIQUE (`employee_id`, `project_id`)

---

## 3. Current API Endpoints

All protected endpoints require authorization header: `Authorization: Bearer <token>`.

### Authentication
- `POST /api/auth/login` - Public. Logs in an admin and returns a JWT.

### Dashboard
- `GET /api/dashboard` - Protected. Returns summaries, recent changes, and project status distributions.

### Employees
- `GET /api/employees` - Protected. Returns a paginated list of employees with search and workload status summaries.
- `GET /api/employees/:id` - Protected. Returns a single employee details with assigned projects.
- `POST /api/employees` - Protected. Creates an employee (multipart/form-data with profile photo).
- `PUT /api/employees/:id` - Protected. Updates an employee (multipart/form-data with profile photo).
- `DELETE /api/employees/:id` - Protected. Deletes an employee.

### Projects
- `GET /api/projects` - Protected. Returns paginated projects with status/search filters.
- `GET /api/projects/:id` - Protected. Returns a single project details with assigned employees.
- `POST /api/projects` - Protected. Creates a project.
- `PUT /api/projects/:id` - Protected. Updates a project.
- `DELETE /api/projects/:id` - Protected. Deletes a project.

### Assignments
- `POST /api/assignments` - Protected. Assigns multiple employees to a project.
- `DELETE /api/assignments/:id` - Protected. Removes a specific assignment.
- `GET /api/assignments/project/:projectId` - Protected. Gets all assignments for a project.
- `GET /api/assignments/employee/:employeeId` - Protected. Gets all assignments for an employee.

---

## 4. Current Dashboard Functionality

- **Summary Cards**: Displays Total Employees, Total Projects, Active Projects, and Completed Projects.
- **Recent Employees**: Displays a table containing the 5 most recently created employee records (Name, Email, Department, Designation, Creation Date).
- **Recent Projects**: Displays a table containing the 5 most recently created projects (Name, Status, Dates).
- **Project Status Statistics**: Displays the distribution of projects across 'Active', 'Completed', and 'On Hold' states with progress bars.
- **Quick Actions Panel**: Direct navigation links to create/manage items quickly.
