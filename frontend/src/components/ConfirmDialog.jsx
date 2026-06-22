const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', onCancel, onConfirm, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger" disabled={loading}>
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
