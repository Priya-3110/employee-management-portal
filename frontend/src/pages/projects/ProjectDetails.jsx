import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Avatar from '../../components/Avatar.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { projectService } from '../../services/projectService.js';
import { formatDate } from '../../utils/formatters.js';

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-800">{value || 'Not set'}</p>
  </div>
);

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await projectService.getById(id);
        setProject(response.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load project details.');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading project details..." />;

  if (!project) {
    return <EmptyState title="Project not found" actionLabel="Back to Projects" actionTo="/projects" />;
  }

  return (
    <div className="page-shell">
      <PageHeader title="Project Details" description="Project scope, status, timeline, and assigned employees.">
        <Link to="/projects" className="btn-secondary">
          Back
        </Link>
        <Link to={`/projects/${project.id}/edit`} className="btn-primary">
          Edit Project
        </Link>
      </PageHeader>

      <section className="section-panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">{project.project_name}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{project.description || 'No description provided.'}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-8 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Start Date" value={formatDate(project.start_date)} />
          <DetailItem label="End Date" value={formatDate(project.end_date)} />
          <DetailItem label="Assigned Employees" value={project.employees?.length || 0} />
          <DetailItem label="Created At" value={formatDate(project.created_at)} />
        </div>
      </section>

      <section className="section-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-950">Assigned Employees</h3>
          <Link to="/assignments/assign" className="btn-secondary">
            Manage
          </Link>
        </div>
        {project.employees?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {project.employees.map((employee) => (
              <Link key={employee.id} to={`/employees/${employee.id}`} className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50">
                <Avatar name={employee.full_name} image={employee.profile_image} size="sm" />
                <div>
                  <p className="font-bold text-slate-900">{employee.full_name}</p>
                  <p className="text-sm text-slate-500">{employee.designation}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No assigned employees" description="Assign employees to this project from the assignments page." />
        )}
      </section>
    </div>
  );
};

export default ProjectDetails;
