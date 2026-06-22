import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Avatar from '../../components/Avatar.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import { employeeService } from '../../services/employeeService.js';
import useDebounce from '../../hooks/useDebounce.js';
import { formatDate } from '../../utils/formatters.js';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
      });
      setEmployees(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeeService.remove(deleteTarget.id);
      toast.success('Employee deleted successfully.');
      setDeleteTarget(null);
      loadEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete employee.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Employees"
        description="Search, add, edit, view, and delete employee records."
        actionLabel="Add Employee"
        actionTo="/employees/add"
      />

      <section className="section-panel">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="form-input mt-0 max-w-md"
            placeholder="Search employees by name, email, phone, department..."
          />
          <p className="text-sm text-slate-500">
            Total: <span className="font-bold text-slate-900">{meta.total || 0}</span>
          </p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading employees..." />
        ) : employees.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={employee.full_name} image={employee.profile_image} size="sm" />
                          <div>
                            <p className="font-bold text-slate-900">{employee.full_name}</p>
                            <p className="text-xs text-slate-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{employee.phone}</td>
                      <td className="px-4 py-3 text-slate-600">{employee.department}</td>
                      <td className="px-4 py-3 text-slate-600">{employee.designation}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(employee.joining_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link to={`/employees/${employee.id}`} className="btn-secondary px-3 py-1.5">
                            View
                          </Link>
                          <Link to={`/employees/${employee.id}/edit`} className="btn-secondary px-3 py-1.5">
                            Edit
                          </Link>
                          <button type="button" className="btn-danger px-3 py-1.5" onClick={() => setDeleteTarget(employee)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={meta.page || page} totalPages={meta.totalPages || 1} onPageChange={setPage} />
          </>
        ) : (
          <div className="p-4">
            <EmptyState
              title="No employees found"
              description="Try a different search or create a new employee profile."
              actionLabel="Add Employee"
              actionTo="/employees/add"
            />
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete employee"
        message={`Delete ${deleteTarget?.full_name || 'this employee'}? This will also remove project assignments for this employee.`}
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EmployeeList;
