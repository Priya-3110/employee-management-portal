import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Avatar from '../../components/Avatar.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { assignmentService } from '../../services/assignmentService.js';
import { employeeService } from '../../services/employeeService.js';
import { projectService } from '../../services/projectService.js';
import { formatDate } from '../../utils/formatters.js';

const ManageAssignments = () => {
  const [mode, setMode] = useState('project');
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => String(project.id) === String(selectedId)),
    [projects, selectedId]
  );
  const selectedEmployee = useMemo(
    () => employees.find((employee) => String(employee.id) === String(selectedId)),
    [employees, selectedId]
  );

  const loadBaseData = async () => {
    try {
      const [employeeResponse, projectResponse] = await Promise.all([
        employeeService.getAll({ limit: 100 }),
        projectService.getAll({ limit: 100 }),
      ]);
      setEmployees(employeeResponse.data.data);
      setProjects(projectResponse.data.data);
      setSelectedId(String(projectResponse.data.data[0]?.id || ''));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load assignment data.');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    if (!selectedId) {
      setAssignments([]);
      return;
    }

    setAssignmentLoading(true);
    try {
      const response =
        mode === 'project'
          ? await assignmentService.getByProject(selectedId)
          : await assignmentService.getByEmployee(selectedId);
      setAssignments(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load assignments.');
    } finally {
      setAssignmentLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (mode === 'project') {
      setSelectedId(String(projects[0]?.id || ''));
    } else {
      setSelectedId(String(employees[0]?.id || ''));
    }
  }, [mode]);

  useEffect(() => {
    loadAssignments();
  }, [mode, selectedId]);

  const handleRemove = async (assignmentId) => {
    try {
      await assignmentService.remove(assignmentId);
      toast.success('Assignment removed.');
      loadAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove assignment.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading assignments..." />;

  const options = mode === 'project' ? projects : employees;

  return (
    <div className="page-shell">
      <PageHeader title="Manage Assignments" description="View assigned employees for projects and assigned projects for employees.">
        <Link to="/assignments/assign" className="btn-primary">
          Assign Employees
        </Link>
      </PageHeader>

      <section className="section-panel p-5">
        <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-end">
          <div>
            <p className="form-label">View By</p>
            <div className="mt-2 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
              {[
                ['project', 'Project'],
                ['employee', 'Employee'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                    mode === value ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="form-label">{mode === 'project' ? 'Project' : 'Employee'}</span>
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="form-input">
              <option value="">Select {mode}</option>
              {options.map((item) => (
                <option key={item.id} value={item.id}>
                  {mode === 'project' ? item.project_name : item.full_name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {mode === 'project' && selectedProject ? (
        <section className="section-panel p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-bold text-slate-950">{selectedProject.project_name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {formatDate(selectedProject.start_date)} - {formatDate(selectedProject.end_date)}
              </p>
            </div>
            <StatusBadge status={selectedProject.status} />
          </div>
        </section>
      ) : null}

      {mode === 'employee' && selectedEmployee ? (
        <section className="section-panel p-5">
          <div className="flex items-center gap-3">
            <Avatar name={selectedEmployee.full_name} image={selectedEmployee.profile_image} />
            <div>
              <p className="text-lg font-bold text-slate-950">{selectedEmployee.full_name}</p>
              <p className="text-sm text-slate-500">{selectedEmployee.designation}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-panel">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-950">
            {mode === 'project' ? 'Assigned Employees' : 'Assigned Projects'}
          </h3>
        </div>

        {assignmentLoading ? (
          <LoadingSpinner label="Loading selected assignments..." />
        ) : assignments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">{mode === 'project' ? 'Employee' : 'Project'}</th>
                  <th className="px-4 py-3">{mode === 'project' ? 'Department' : 'Status'}</th>
                  <th className="px-4 py-3">{mode === 'project' ? 'Designation' : 'Timeline'}</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50">
                    {mode === 'project' ? (
                      <>
                        <td className="px-4 py-3">
                          <Link to={`/employees/${assignment.employee?.id}`} className="flex items-center gap-3">
                            <Avatar
                              name={assignment.employee?.full_name}
                              image={assignment.employee?.profile_image}
                              size="sm"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{assignment.employee?.full_name}</p>
                              <p className="text-xs text-slate-500">{assignment.employee?.email}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{assignment.employee?.department}</td>
                        <td className="px-4 py-3 text-slate-600">{assignment.employee?.designation}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <Link to={`/projects/${assignment.project?.id}`} className="font-bold text-slate-900">
                            {assignment.project?.project_name}
                          </Link>
                          <p className="mt-1 line-clamp-1 max-w-xl text-xs text-slate-500">
                            {assignment.project?.description || 'No description'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={assignment.project?.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(assignment.project?.start_date)} - {formatDate(assignment.project?.end_date)}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="btn-danger px-3 py-1.5" onClick={() => handleRemove(assignment.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No assignments found"
              description="Create an employee-project assignment to see it here."
              actionLabel="Assign Employees"
              actionTo="/assignments/assign"
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageAssignments;
