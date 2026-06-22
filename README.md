# Employee & Project Management Portal

A complete full-stack Employee & Project Management Portal built with React, Vite, JavaScript, Tailwind CSS, Node.js, Express, JWT authentication, Sequelize, and MySQL.

The application provides a professional HRMS-style interface for managing employees, projects, and employee-project assignments.

## Features

- JWT-based admin login and protected frontend routes.
- Default admin seed: `admin@example.com` / `admin123`.
- Dashboard cards for total employees, total projects, active projects, and completed projects.
- Recent employees and projects tables.
- Project status statistics.
- Employee CRUD with search, pagination, profile image upload, image preview, unique email validation, and phone validation.
- Project CRUD with search, status filter, pagination, and date validation.
- Many-to-many employee-project assignment workflow.
- Multi-select employee assignment.
- View assigned employees for a project and assigned projects for an employee.
- Responsive corporate UI with sidebar navigation, top navbar, tables, loading states, empty states, and confirmation dialogs.
- MVC backend architecture with centralized error handling.

## Technology Stack

### Frontend

- React.js with Vite
- JavaScript, no TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- React Hook Form
- React Toastify

### Backend

- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- Multer
- CORS
- dotenv

### Database

- MySQL
- Sequelize ORM

## Folder Structure

```text
.
├── backend
│   ├── config
│   ├── controllers
│   ├── database
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── utils
│   ├── app.js
│   └── server.js
├── docs
│   └── API_DOCUMENTATION.md
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   └── vite.config.js
├── README.md
└── README_PROGRESS.md
```

## Installation

### 1. Clone or open the project

```bash
cd employement
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=employee_project_portal
DB_USER=root
DB_PASSWORD=
DB_LOGGING=false
DB_SYNC=true
DB_SYNC_ALTER=true

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
RESET_ADMIN_PASSWORD=false

MAX_FILE_SIZE=2097152
```

### Frontend

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Database Setup

1. Start MySQL.
2. Create the database:

```sql
CREATE DATABASE employee_project_portal;
```

3. Either let Sequelize sync tables automatically with `DB_SYNC=true`, or run:

```bash
mysql -u root -p < backend/database/schema.sql
```

4. Start the backend once. The default admin user is seeded automatically.

## Running the Application

### Backend

```bash
cd backend
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## API Documentation

Full endpoint details are available in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

Main endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Admin login |
| GET | `/api/dashboard` | Dashboard summary |
| GET | `/api/employees` | List employees |
| GET | `/api/employees/:id` | View employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | View project |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/assignments` | Assign employees to project |
| DELETE | `/api/assignments/:id` | Remove assignment |
| GET | `/api/assignments/project/:projectId` | View employees assigned to project |
| GET | `/api/assignments/employee/:employeeId` | View projects assigned to employee |

## Screenshots

Add screenshots here after running the project:

- Login Page
- Dashboard
- Employee List
- Project List
- Assignment Management

## Deployment Guide

### Backend

1. Set production environment variables.
2. Use a managed MySQL database.
3. Set `NODE_ENV=production`.
4. Set `DB_SYNC=false` after tables are created.
5. Run the API with a process manager such as PM2:

```bash
npm install -g pm2
cd backend
pm2 start server.js --name employee-project-api
```

### Frontend

1. Set `VITE_API_BASE_URL` to the deployed backend API URL.
2. Build the frontend:

```bash
cd frontend
npm run build
```

3. Deploy the `frontend/dist` folder to a static host such as Netlify, Vercel, or Nginx.

## Production Notes

- Replace `JWT_SECRET` with a strong random value.
- Store uploaded files in persistent object storage for cloud deployments.
- Keep `CLIENT_URL` restricted to trusted frontend origins.
- Use HTTPS in production.
- Run migrations or SQL schema setup explicitly before disabling `DB_SYNC`.
