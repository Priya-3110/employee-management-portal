const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
