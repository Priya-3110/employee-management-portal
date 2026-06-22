import { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Avatar from '../../components/Avatar.jsx';
import AvailabilityBadge from '../../components/AvailabilityBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { projectService } from '../../services/projectService.js';
import { recommendationService } from '../../services/recommendationService.js';
import { assignmentService } from '../../services/assignmentService.js';
import { formatDate } from '../../utils/formatters.js';

const SmartRecommendations = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null); // Tracks which employee is being assigned/removed

  const loadData = async () => {
    try {
      const [projectRes, recsRes, assignmentsRes] = await Promise.all([
        projectService.getById(projectId),
        recommendationService.getRecommendations(projectId),
        assignmentService.getByProject(projectId),
      ]);
      setProject(projectRes.data.data);
      setRecommendations(recsRes.data.data);
      setAssignments(assignmentsRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load project matching recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  // Create a map of employeeId -> assignmentId for quick lookup
  const assignmentMap = useMemo(() => {
    const map = new Map();
    assignments.forEach((assignment) => {
      if (assignment.employee_id) {
        map.set(Number(assignment.employee_id), assignment.id);
      }
    });
    return map;
  }, [assignments]);

  const handleAssign = async (employeeId) => {
    setActioningId(employeeId);
    try {
      await assignmentService.create({
        project_id: Number(projectId),
        employee_ids: [employeeId],
      });
      toast.success('Resource assigned successfully.');
      // Reload recommendations and assignments to update scores and badges
      const [recsRes, assignmentsRes] = await Promise.all([
        recommendationService.getRecommendations(projectId),
        assignmentService.getByProject(projectId),
      ]);
      setRecommendations(recsRes.data.data);
      setAssignments(assignmentsRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign employee to this project.');
    } finally {
      setActioningId(null);
    }
  };

  const handleRemove = async (employeeId, assignmentId) => {
    setActioningId(employeeId);
    try {
      await assignmentService.remove(assignmentId);
      toast.success('Assignment removed successfully.');
      // Reload recommendations and assignments
      const [recsRes, assignmentsRes] = await Promise.all([
        recommendationService.getRecommendations(projectId),
        assignmentService.getByProject(projectId),
      ]);
      setRecommendations(recsRes.data.data);
      setAssignments(assignmentsRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove employee assignment.');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Running smart resource matching algorithms..." />;

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The project you are requesting recommendations for does not exist."
        actionLabel="Back to Projects"
        actionTo="/projects"
      />
    );
  }

  // Parse required skills for comparison in UI
  const requiredSkills = project.required_skills || [];

  return (
    <div className="page-shell">
      <PageHeader
        title="Smart Matching Recommendations"
        description="Ranked candidates based on skill match alignment, job designation, and current availability status."
      >
        <Link to={`/projects/${projectId}`} className="btn-secondary">
          Back to Project Details
        </Link>
      </PageHeader>

      {/* Project Details Panel */}
      <section className="section-panel p-5 bg-slate-50 border border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">{project.project_name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Timeline: {formatDate(project.start_date)} - {formatDate(project.end_date)}
            </p>
            {project.project_role && (
              <p className="mt-1 text-xs font-bold text-slate-600">
                Target Role: <span className="text-blue-700">{project.project_role}</span>
              </p>
            )}
          </div>
          <div>
            {requiredSkills.length ? (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Required Skills:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs italic text-slate-500">No specific skills listed as required</p>
            )}
          </div>
        </div>
      </section>

      {/* Matches Title */}
      <div className="flex items-center justify-between mt-6">
        <h4 className="text-lg font-black text-slate-950">Matching Candidates ({recommendations.length})</h4>
      </div>

      {/* Recommendations Cards */}
      {recommendations.length ? (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const assignmentId = assignmentMap.get(Number(rec.employeeId));
            const isAssigned = !!assignmentId;
            const isWorking = actioningId === rec.employeeId;

            // Get match percentage color styling
            let matchColor = 'text-slate-700 bg-slate-50 border-slate-200';
            if (rec.matchPercentage >= 75) {
              matchColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
            } else if (rec.matchPercentage >= 40) {
              matchColor = 'text-blue-700 bg-blue-50 border-blue-200';
            } else if (rec.matchPercentage > 0) {
              matchColor = 'text-amber-700 bg-amber-50 border-amber-200';
            }

            return (
              <div
                key={rec.employeeId}
                className={`section-panel p-5 grid gap-5 md:grid-cols-[1fr_260px_180px] items-center border transition hover:border-slate-300 ${
                  isAssigned ? 'bg-blue-50/20 border-blue-100' : 'bg-white'
                }`}
              >
                {/* Employee Details and Matching Details */}
                <div className="flex items-start gap-4">
                  <Avatar name={rec.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/employees/${rec.employeeId}`}
                        className="font-bold text-slate-900 hover:text-blue-600 truncate"
                      >
                        {rec.name}
                      </Link>
                      <AvailabilityBadge status={rec.status} />
                      {isAssigned && (
                        <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                          Assigned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {rec.designation}
                    </p>

                    {/* Skill Overlaps & Missing Skills */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1 text-xs">
                        <span className="font-bold text-slate-500 mr-1">Skills Matching:</span>
                        {requiredSkills.length ? (
                          requiredSkills.map((skill, idx) => {
                            const hasSkill = rec.matchingSkills?.some(
                              (s) => s.toLowerCase() === skill.toLowerCase()
                            );
                            return (
                              <span
                                key={idx}
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                                  hasSkill
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                    : 'bg-slate-50 text-slate-400 ring-slate-500/10'
                                }`}
                              >
                                {skill}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-slate-400 italic">None required</span>
                        )}
                      </div>

                      {/* Designation Match Indicator */}
                      {project.project_role && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span className="text-slate-500 font-bold">Role Fit:</span>
                          {rec.designation?.toLowerCase().includes(project.project_role.toLowerCase()) ||
                          project.project_role.toLowerCase().includes(rec.designation?.toLowerCase()) ? (
                            <span className="text-emerald-700 flex items-center gap-0.5">
                              ✓ Matches "{project.project_role}"
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              No direct match (Employee is {rec.designation})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score and Workload */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0">
                  <div className="flex flex-col md:items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Bandwidth
                    </span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5">
                      {rec.activeProjects} / {rec.maxProjects} Active
                    </span>
                  </div>

                  <div className="flex flex-col md:items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Match Rating
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-black ring-1 ring-inset ${matchColor}`}>
                        {rec.matchPercentage}% Fit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="flex justify-end pt-3 border-t border-slate-100 md:border-t-0 md:pt-0">
                  {isAssigned ? (
                    <button
                      type="button"
                      className="btn-danger w-full md:w-auto px-4 py-2"
                      disabled={isWorking}
                      onClick={() => handleRemove(rec.employeeId, assignmentId)}
                    >
                      {isWorking ? 'Removing...' : 'Remove'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary w-full md:w-auto px-4 py-2"
                      disabled={isWorking || (project.status === 'Active' && rec.activeProjects >= rec.maxProjects)}
                      onClick={() => handleAssign(rec.employeeId)}
                    >
                      {isWorking ? 'Assigning...' : 'Assign'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No candidates available"
          description="We couldn't generate recommendations for this project. Check if there are employees in the system."
        />
      )}
    </div>
  );
};

export default SmartRecommendations;
