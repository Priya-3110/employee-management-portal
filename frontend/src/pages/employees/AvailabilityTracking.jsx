import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Avatar from '../../components/Avatar.jsx';
import AvailabilityBadge from '../../components/AvailabilityBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import WorkloadBar from '../../components/WorkloadBar.jsx';
import { recommendationService } from '../../services/recommendationService.js';

const AvailabilityTracking = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const loadAvailability = async () => {
    try {
      const response = await recommendationService.getAvailability();
      setData(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load employee availability information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  // Compute metrics from fetched data
  const metrics = useMemo(() => {
    const counts = {
      total: data.length,
      available: 0,
      busy: 0,
      overloaded: 0,
    };

    data.forEach((emp) => {
      const status = emp.availability?.status;
      if (status === 'Available') counts.available++;
      else if (status === 'Busy') counts.busy++;
      else if (status === 'Overloaded') counts.overloaded++;
    });

    return counts;
  }, [data]);

  // Unique list of departments for the dropdown
  const departments = useMemo(() => {
    const deps = data.map((emp) => emp.department).filter(Boolean);
    return [...new Set(deps)].sort();
  }, [data]);

  // Filter and search
  const filteredEmployees = useMemo(() => {
    return data.filter((emp) => {
      const matchesSearch =
        emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(search.toLowerCase()) ||
        emp.department?.toLowerCase().includes(search.toLowerCase()) ||
        (emp.skills && emp.skills.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter ? emp.availability?.status === statusFilter : true;
      const matchesDept = departmentFilter ? emp.department === departmentFilter : true;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [data, search, statusFilter, departmentFilter]);

  if (loading) return <LoadingSpinner label="Loading resource workload planner..." />;

  return (
    <div className="page-shell">
      <PageHeader
        title="Resource Planner & Workload Tracking"
        description="Monitor staff assignments, track active project count constraints, and balance team bandwidth."
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Managed Staff"
          value={metrics.total}
          helper="Total employees in system"
          tone="slate"
        />
        <StatCard
          label="Available"
          value={metrics.available}
          helper="0 - 1 active projects"
          tone="green"
        />
        <StatCard
          label="Busy (At Capacity)"
          value={metrics.busy}
          helper="Optimal workload level"
          tone="blue"
        />
        <StatCard
          label="Overloaded"
          value={metrics.overloaded}
          helper="Exceeded max projects limit"
          tone="red"
        />
      </div>

      {/* Filter and Search Panel */}
      <section className="section-panel p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, designation, department, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input w-full"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input min-w-[160px]"
            >
              <option value="">All Workloads</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Overloaded">Overloaded</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="form-input min-w-[180px]"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Employee List / Grid */}
      {filteredEmployees.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className={`section-panel flex flex-col justify-between p-5 border-t-4 transition hover:shadow-md ${
                employee.availability?.status === 'Available'
                  ? 'border-emerald-500'
                  : employee.availability?.status === 'Busy'
                    ? 'border-blue-500'
                    : 'border-red-500'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={employee.full_name} image={employee.profile_image} size="md" />
                    <div>
                      <Link
                        to={`/employees/${employee.id}`}
                        className="text-base font-bold text-slate-900 hover:text-blue-600"
                      >
                        {employee.full_name}
                      </Link>
                      <p className="text-xs font-semibold text-slate-500">{employee.designation}</p>
                      <p className="text-xs text-slate-400">{employee.department}</p>
                    </div>
                  </div>
                  <AvailabilityBadge status={employee.availability?.status} />
                </div>

                <div className="mt-5">
                  <WorkloadBar
                    activeProjects={employee.availability?.activeProjects}
                    maxProjects={employee.availability?.maxProjects}
                    percentage={employee.availability?.workloadPercentage}
                  />
                </div>

                {/* Skills Tags */}
                {employee.skills && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {employee.skills
                        .split(',')
                        .map((skill) => skill.trim())
                        .filter(Boolean)
                        .map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Projects List */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Active Assignments ({employee.activeProjects?.length || 0})
                </p>
                {employee.activeProjects?.length ? (
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                    {employee.activeProjects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="block text-xs font-bold text-blue-600 hover:underline truncate"
                      >
                        • {project.project_name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">No active projects assigned</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No resources found"
          description="Try adjusting your filter settings or search terms to find available staff."
        />
      )}
    </div>
  );
};

export default AvailabilityTracking;
