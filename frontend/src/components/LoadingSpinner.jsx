const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="flex min-h-48 items-center justify-center">
    <div className="flex items-center gap-3 rounded-lg bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      {label}
    </div>
  </div>
);

export default LoadingSpinner;
