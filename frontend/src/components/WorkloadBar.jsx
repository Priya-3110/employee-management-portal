const WorkloadBar = ({ activeProjects = 0, maxProjects = 3, percentage = 0 }) => {
  const width = `${Math.min(Number(percentage) || 0, 100)}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">
          Current Load: {activeProjects} / {maxProjects} Projects
        </span>
        <span className="font-bold text-slate-900">{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width }} />
      </div>
    </div>
  );
};

export default WorkloadBar;
