const statusStyles = {
  Active: 'bg-blue-50 text-blue-700 ring-blue-100',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'On Hold': 'bg-amber-50 text-amber-700 ring-amber-100',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[status] || statusStyles.Active}`}>
    {status}
  </span>
);

export default StatusBadge;
