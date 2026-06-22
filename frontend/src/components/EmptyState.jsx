import { Link } from 'react-router-dom';

const EmptyState = ({ title = 'No records found', description, actionLabel, actionTo }) => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-lg font-bold text-blue-700">EP</div>
    <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
    {description ? <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p> : null}
    {actionLabel && actionTo ? (
      <Link to={actionTo} className="btn-primary mt-5">
        {actionLabel}
      </Link>
    ) : null}
  </div>
);

export default EmptyState;
