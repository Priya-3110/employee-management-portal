import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import { projectService } from '../../services/projectService.js';
import { PROJECT_STATUSES } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectService.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
        status,
      });
      setProjects(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.remove(deleteTarget.id);
      toast.success('Project deleted successfully.');
      setDeleteTarget(null);
      loadProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete project.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Projects"
        description="Create, search, filter, edit, and monitor project records."
        actionLabel="Create Project"
        actionTo="/projects/add"
      />

      <section className="section-panel">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[1fr_220px_auto] md:items-center">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="form-input mt-0"
            placeholder="Search projects by name or description..."
          />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-input mt-0">
            <option value="">All statuses</option>
            {PROJECT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <p className="text-sm text-slate-500">
            Total: <span className="font-bold text-slate-900">{meta.total || 0}</span>
          </p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading projects..." />
        ) : projects.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">End Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{project.project_name}</p>
                        <p className="mt-1 line-clamp-1 max-w-xl text-xs text-slate-500">{project.description || 'No description'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(project.start_date)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(project.end_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link to={`/projects/${project.id}`} className="btn-secondary px-3 py-1.5">
                            View
                          </Link>
                          <Link to={`/projects/${project.id}/edit`} className="btn-secondary px-3 py-1.5">
                            Edit
                          </Link>
                          <button type="button" className="btn-danger px-3 py-1.5" onClick={() => setDeleteTarget(project)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={meta.page || page} totalPages={meta.totalPages || 1} onPageChange={setPage} />
          </>
        ) : (
          <div className="p-4">
            <EmptyState
              title="No projects found"
              description="Try a different search or create a project."
              actionLabel="Create Project"
              actionTo="/projects/add"
            />
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete project"
        message={`Delete ${deleteTarget?.project_name || 'this project'}? This will also remove employee assignments for this project.`}
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ProjectList;
