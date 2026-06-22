const StatCard = ({ label, value, helper, tone = 'blue' }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="section-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          {helper ? <p className="mt-2 text-xs font-medium text-slate-500">{helper}</p> : null}
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-black ${tones[tone]}`}>
          {String(label).slice(0, 1)}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
