import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Avatar from '../../components/Avatar.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { employeeService } from '../../services/employeeService.js';
import { formatDate } from '../../utils/formatters.js';

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-800">{value || 'Not set'}</p>
  </div>
);

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const response = await employeeService.getById(id);
        setEmployee(response.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load employee details.');
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading employee details..." />;

  if (!employee) {
    return <EmptyState title="Employee not found" actionLabel="Back to Employees" actionTo="/employees" />;
  }

  return (
    <div className="page-shell">
      <PageHeader title="Employee Details" description="Profile, contact information, and assigned projects.">
        <Link to="/employees" className="btn-secondary">
          Back
        </Link>
        <Link to={`/employees/${employee.id}/edit`} className="btn-primary">
          Edit Employee
        </Link>
      </PageHeader>

      <section className="section-panel p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <Avatar name={employee.full_name} image={employee.profile_image} size="lg" />
          <div>
            <h2 className="text-2xl font-black text-slate-950">{employee.full_name}</h2>
            <p className="mt-1 text-sm text-slate-500">{employee.designation}</p>
            <p className="mt-2 text-sm font-semibold text-blue-700">{employee.department}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Email" value={employee.email} />
          <DetailItem label="Phone" value={employee.phone} />
          <DetailItem label="Joining Date" value={formatDate(employee.joining_date)} />
          <DetailItem label="Created At" value={formatDate(employee.created_at)} />
        </div>
      </section>

      <section className="section-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-950">Assigned Projects</h3>
          <Link to="/assignments/assign" className="btn-secondary">
            Manage
          </Link>
        </div>
        {employee.projects?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {employee.projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="rounded-lg border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{project.project_name}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {formatDate(project.start_date)} - {formatDate(project.end_date)}
                    </p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No assigned projects" description="This employee is not assigned to a project yet." />
        )}
      </section>
    </div>
  );
};

export default EmployeeDetails;
