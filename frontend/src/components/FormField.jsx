const FormField = ({ label, error, children }) => (
  <label className="block">
    <span className="form-label">{label}</span>
    {children}
    {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error.message}</span> : null}
  </label>
);

export default FormField;
