import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AssignEmployees from './pages/assignments/AssignEmployees.jsx';
import ManageAssignments from './pages/assignments/ManageAssignments.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import EmployeeDetails from './pages/employees/EmployeeDetails.jsx';
import EmployeeForm from './pages/employees/EmployeeForm.jsx';
import EmployeeList from './pages/employees/EmployeeList.jsx';
import ProjectDetails from './pages/projects/ProjectDetails.jsx';
import ProjectForm from './pages/projects/ProjectForm.jsx';
import ProjectList from './pages/projects/ProjectList.jsx';
import NotFound from './pages/NotFound.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="employees" element={<EmployeeList />} />
      <Route path="employees/add" element={<EmployeeForm />} />
      <Route path="employees/:id" element={<EmployeeDetails />} />
      <Route path="employees/:id/edit" element={<EmployeeForm />} />
      <Route path="projects" element={<ProjectList />} />
      <Route path="projects/add" element={<ProjectForm />} />
      <Route path="projects/:id" element={<ProjectDetails />} />
      <Route path="projects/:id/edit" element={<ProjectForm />} />
      <Route path="assignments" element={<ManageAssignments />} />
      <Route path="assignments/assign" element={<AssignEmployees />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
