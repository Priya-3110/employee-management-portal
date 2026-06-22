# API Documentation

Base URL: `http://localhost:5000/api`

Protected endpoints require:

```http
Authorization: Bearer <jwt_token>
```

## Authentication

### POST `/auth/login`

Login with admin credentials.

Request:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful.",
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## Dashboard

### GET `/dashboard`

Returns total employees, total projects, active projects, completed projects, recent employees, recent projects, and project status statistics.

## Employees

### GET `/employees`

Query parameters:

| Name | Description |
| --- | --- |
| `page` | Page number. Default: `1` |
| `limit` | Page size. Default: `10` |
| `search` | Search by name, email, phone, designation, or department |

### GET `/employees/:id`

Returns one employee with assigned projects.

### POST `/employees`

Creates an employee. Use `multipart/form-data`.

Fields:

| Name | Type | Required |
| --- | --- | --- |
| `full_name` | string | yes |
| `email` | string | yes |
| `phone` | string | yes |
| `designation` | string | yes |
| `department` | string | yes |
| `joining_date` | date | yes |
| `profile_image` | image file | no |

### PUT `/employees/:id`

Updates an employee. Use `multipart/form-data`.

### DELETE `/employees/:id`

Deletes an employee and cascades related assignments.

## Projects

### GET `/projects`

Query parameters:

| Name | Description |
| --- | --- |
| `page` | Page number. Default: `1` |
| `limit` | Page size. Default: `10` |
| `search` | Search by project name or description |
| `status` | `Active`, `Completed`, or `On Hold` |

### GET `/projects/:id`

Returns one project with assigned employees.

### POST `/projects`

Request:

```json
{
  "project_name": "HRMS Upgrade",
  "description": "Modernize internal HR tools.",
  "start_date": "2026-06-01",
  "end_date": "2026-09-30",
  "status": "Active"
}
```

### PUT `/projects/:id`

Updates a project.

### DELETE `/projects/:id`

Deletes a project and cascades related assignments.

## Assignments

### POST `/assignments`

Assigns one or more employees to a project.

Request:

```json
{
  "project_id": 1,
  "employee_ids": [1, 2, 3]
}
```

### DELETE `/assignments/:id`

Removes an employee-project assignment by assignment ID.

### GET `/assignments/project/:projectId`

Returns assigned employees for a project.

### GET `/assignments/employee/:employeeId`

Returns assigned projects for an employee.

## Error Format

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": ["email must be unique"]
}
```
