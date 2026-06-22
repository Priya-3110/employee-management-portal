import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { dashboardService } from '../services/dashboardService.js';
import { formatDate } from '../utils/formatters.js';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await dashboardService.getSummary();
        setSummary(response.data.data);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  const cards = summary?.cards || {};
  const statusStats = summary?.projectStatusStatistics || {};
  const totalProjects = Math.max(cards.totalProjects || 0, 1);

  return (
    <div className="page-shell">
      <PageHeader title="Dashboard" description="Overview of employee records, project delivery status, and recent activity." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={cards.totalEmployees || 0} helper="People currently in the directory" tone="blue" />
        <StatCard label="Total Projects" value={cards.totalProjects || 0} helper="Projects tracked in the portal" tone="slate" />
        <StatCard label="Active Projects" value={cards.activeProjects || 0} helper="Currently in progress" tone="blue" />
        <StatCard label="Completed Projects" value={cards.completedProjects || 0} helper="Finished and delivered" tone="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="section-panel p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-950">Recent Employees</h3>
            <Link to="/employees" className="text-sm font-bold text-blue-600">
              View all
            </Link>
          </div>
          {summary?.recentEmployees?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Employee</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Designation</th>
                    <th className="px-3 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.recentEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={employee.full_name} image={employee.profile_image} size="sm" />
                          <div>
                            <p className="font-bold text-slate-900">{employee.full_name}</p>
                            <p className="text-xs text-slate-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{employee.department}</td>
                      <td className="px-3 py-3 text-slate-600">{employee.designation}</td>
                      <td className="px-3 py-3 text-slate-500">{formatDate(employee.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No employees yet" description="Add employees to see recent activity here." actionLabel="Add Employee" actionTo="/employees/add" />
          )}
        </section>

        <section className="section-panel p-5">
          <h3 className="text-lg font-bold text-slate-950">Project Status Statistics</h3>
          <div className="mt-5 space-y-5">
            {['Active', 'Completed', 'On Hold'].map((status) => {
              const value = statusStats[status] || 0;
              const width = `${Math.round((value / totalProjects) * 100)}%`;
              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="text-sm font-bold text-slate-700">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="section-panel p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-950">Recent Projects</h3>
            <Link to="/projects" className="text-sm font-bold text-blue-600">
              View all
            </Link>
          </div>
          {summary?.recentProjects?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Project</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-3 py-3 font-bold text-slate-900">{project.project_name}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {formatDate(project.start_date)} - {formatDate(project.end_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No projects yet" description="Create a project to begin tracking assignments." actionLabel="Create Project" actionTo="/projects/add" />
          )}
        </section>

        <section className="section-panel p-5">
          <h3 className="text-lg font-bold text-slate-950">Quick Navigation</h3>
          <div className="mt-4 grid gap-3">
            {[
              ['/employees/add', 'Add Employee', 'Create a new employee record'],
              ['/projects/add', 'Create Project', 'Register a project with timeline and status'],
              ['/assignments/assign', 'Assign Employees', 'Connect team members to projects'],
            ].map(([to, title, description]) => (
              <Link key={to} to={to} className="rounded-lg border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50">
                <p className="font-bold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
