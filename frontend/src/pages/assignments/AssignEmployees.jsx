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

const AssignEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [employeeIds, setEmployeeIds] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => String(project.id) === String(projectId)),
    [projects, projectId]
  );
  const assignedEmployeeIds = useMemo(
    () => new Set(assignments.map((assignment) => assignment.employee_id)),
    [assignments]
  );

  const loadBaseData = async () => {
    try {
      const [employeeResponse, projectResponse] = await Promise.all([
        employeeService.getAll({ limit: 100 }),
        projectService.getAll({ limit: 100 }),
      ]);
      setEmployees(employeeResponse.data.data);
      setProjects(projectResponse.data.data);
      if (projectResponse.data.data[0]) {
        setProjectId(String(projectResponse.data.data[0].id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load assignment data.');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (nextProjectId) => {
    if (!nextProjectId) {
      setAssignments([]);
      return;
    }

    setAssignmentLoading(true);
    try {
      const response = await assignmentService.getByProject(nextProjectId);
      setAssignments(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load assigned employees.');
    } finally {
      setAssignmentLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadAssignments(projectId);
    setEmployeeIds([]);
  }, [projectId]);

  const toggleEmployee = (id) => {
    setEmployeeIds((current) =>
      current.includes(id) ? current.filter((employeeId) => employeeId !== id) : [...current, id]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!projectId || employeeIds.length === 0) {
      toast.error('Select a project and at least one employee.');
      return;
    }

    setSaving(true);
    try {
      await assignmentService.create({
        project_id: Number(projectId),
        employee_ids: employeeIds,
      });
      toast.success('Employees assigned successfully.');
      setEmployeeIds([]);
      loadAssignments(projectId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to assign employees.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (assignmentId) => {
    try {
      await assignmentService.remove(assignmentId);
      toast.success('Assignment removed.');
      loadAssignments(projectId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove assignment.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading assignment tools..." />;

  return (
    <div className="page-shell">
      <PageHeader title="Assign Employees" description="Attach one or more employees to a selected project.">
        <Link to="/assignments" className="btn-secondary">
          Manage Assignments
        </Link>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="section-panel p-5">
          <div className="grid gap-5">
            <label className="block">
              <span className="form-label">Project</span>
              <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="form-input">
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
            </label>

            {selectedProject ? (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">{selectedProject.project_name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDate(selectedProject.start_date)} - {formatDate(selectedProject.end_date)}
                    </p>
                  </div>
                  <StatusBadge status={selectedProject.status} />
                </div>
              </div>
            ) : null}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="form-label">Employees</p>
                <p className="text-xs font-bold text-slate-500">{employeeIds.length} selected</p>
              </div>
              {employees.length ? (
                <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                  {employees.map((employee) => {
                    const alreadyAssigned = assignedEmployeeIds.has(employee.id);
                    const checked = employeeIds.includes(employee.id);
                    return (
                      <label
                        key={employee.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                          checked
                            ? 'border-blue-300 bg-blue-50'
                            : alreadyAssigned
                              ? 'border-slate-200 bg-slate-50 opacity-70'
                              : 'border-slate-200 bg-white hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                          checked={checked}
                          disabled={alreadyAssigned}
                          onChange={() => toggleEmployee(employee.id)}
                        />
                        <Avatar name={employee.full_name} image={employee.profile_image} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-slate-900">{employee.full_name}</span>
                          <span className="block truncate text-xs text-slate-500">
                            {alreadyAssigned ? 'Already assigned' : employee.designation}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No employees available" actionLabel="Add Employee" actionTo="/employees/add" />
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-slate-200 pt-5">
            <button type="submit" className="btn-primary" disabled={saving || !projectId || employeeIds.length === 0}>
              {saving ? 'Assigning...' : 'Assign Selected Employees'}
            </button>
          </div>
        </form>

        <section className="section-panel p-5">
          <h3 className="text-lg font-bold text-slate-950">Assigned to Project</h3>
          <p className="mt-1 text-sm text-slate-500">Current employee assignments for the selected project.</p>
          <div className="mt-5">
            {assignmentLoading ? (
              <LoadingSpinner label="Loading assigned employees..." />
            ) : assignments.length ? (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={assignment.employee?.full_name}
                        image={assignment.employee?.profile_image}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{assignment.employee?.full_name}</p>
                        <p className="truncate text-xs text-slate-500">{assignment.employee?.designation}</p>
                      </div>
                      <button type="button" className="btn-danger px-3 py-1.5" onClick={() => handleRemove(assignment.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No employees assigned" description="Select employees and assign them to this project." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AssignEmployees;
