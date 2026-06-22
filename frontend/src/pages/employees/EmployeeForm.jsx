import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormField from '../../components/FormField.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { employeeService } from '../../services/employeeService.js';
import { DEPARTMENTS } from '../../utils/constants.js';
import { getImageUrl } from '../../utils/formatters.js';

const EmployeeForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [preview, setPreview] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      joining_date: '',
      skills: '',
      max_projects: 3,
      profile_image: null,
    },
  });

  const selectedFile = watch('profile_image');

  useEffect(() => {
    if (!isEdit) return;

    const loadEmployee = async () => {
      try {
        const response = await employeeService.getById(id);
        const employee = response.data.data;
        reset({
          full_name: employee.full_name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          designation: employee.designation || '',
          department: employee.department || '',
          joining_date: employee.joining_date || '',
          skills: employee.skills || '',
          max_projects: employee.max_projects || 3,
        });
        setPreview(getImageUrl(employee.profile_image));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load employee.');
        navigate('/employees');
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id, isEdit, navigate, reset]);

  useEffect(() => {
    const file = selectedFile?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const title = useMemo(() => (isEdit ? 'Edit Employee' : 'Add Employee'), [isEdit]);

  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append('full_name', values.full_name);
    formData.append('email', values.email);
    formData.append('phone', values.phone);
    formData.append('designation', values.designation);
    formData.append('department', values.department);
    formData.append('joining_date', values.joining_date);
    formData.append('skills', values.skills || '');
    formData.append('max_projects', values.max_projects || 3);

    if (values.profile_image?.[0]) {
      formData.append('profile_image', values.profile_image[0]);
    }

    try {
      if (isEdit) {
        await employeeService.update(id, formData);
        toast.success('Employee updated successfully.');
      } else {
        await employeeService.create(formData);
        toast.success('Employee created successfully.');
      }
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save employee.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading employee..." />;

  return (
    <div className="page-shell">
      <PageHeader
        title={title}
        description="Maintain accurate employee details and profile images."
      >
        <Link to="/employees" className="btn-secondary">
          Back to Employees
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="section-panel p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Full Name" error={errors.full_name}>
              <input
                className="form-input"
                placeholder="Priya Sharma"
                {...register('full_name', { required: 'Full name is required.' })}
              />
            </FormField>
            <FormField label="Email" error={errors.email}>
              <input
                type="email"
                className="form-input"
                placeholder="employee@example.com"
                {...register('email', {
                  required: 'Email is required.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address.',
                  },
                })}
              />
            </FormField>
            <FormField label="Phone Number" error={errors.phone}>
              <input
                className="form-input"
                placeholder="+91 9876543210"
                {...register('phone', {
                  required: 'Phone number is required.',
                  pattern: {
                    value: /^[0-9+\-\s()]{7,20}$/,
                    message: 'Enter a valid phone number.',
                  },
                })}
              />
            </FormField>
            <FormField label="Designation" error={errors.designation}>
              <input
                className="form-input"
                placeholder="Senior Developer"
                {...register('designation', { required: 'Designation is required.' })}
              />
            </FormField>
            <FormField label="Department" error={errors.department}>
              <select className="form-input" {...register('department', { required: 'Department is required.' })}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Joining Date" error={errors.joining_date}>
              <input type="date" className="form-input" {...register('joining_date', { required: 'Joining date is required.' })} />
            </FormField>
            <FormField label="Maximum Active Projects" error={errors.max_projects}>
              <input
                type="number"
                min="1"
                className="form-input"
                {...register('max_projects', {
                  required: 'Maximum projects is required.',
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: 'Maximum projects must be at least 1.',
                  },
                })}
              />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Skills" error={errors.skills}>
                <textarea
                  rows="3"
                  className="form-input resize-none"
                  placeholder="React, Node.js, MySQL"
                  {...register('skills', {
                    maxLength: {
                      value: 255,
                      message: 'Skills must be 255 characters or less.',
                    },
                  })}
                />
              </FormField>
              <p className="mt-2 text-xs text-slate-500">Enter comma-separated skills for assignment recommendations.</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="form-label">Profile Image</p>
            <div className="mt-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white">
              {preview ? (
                <img src={preview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-slate-400">Image preview</span>
              )}
            </div>
            <input type="file" accept="image/*" className="form-input" {...register('profile_image')} />
            <p className="mt-2 text-xs text-slate-500">PNG, JPG, or WEBP up to 2 MB.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
          <Link to="/employees" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
