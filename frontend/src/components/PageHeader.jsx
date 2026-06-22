import { Link } from 'react-router-dom';

const PageHeader = ({ title, description, actionLabel, actionTo, children }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
    <div className="flex flex-wrap gap-3">
      {children}
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="btn-primary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  </div>
);

export default PageHeader;
