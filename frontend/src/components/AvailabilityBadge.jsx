const styles = {
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Busy: 'bg-amber-50 text-amber-700 ring-amber-100',
  Overloaded: 'bg-red-50 text-red-700 ring-red-100',
};

const AvailabilityBadge = ({ status = 'Available' }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles[status] || styles.Available}`}>
    {status}
  </span>
);

export default AvailabilityBadge;
