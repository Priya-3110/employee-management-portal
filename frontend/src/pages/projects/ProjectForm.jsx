import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormField from '../../components/FormField.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { projectService } from '../../services/projectService.js';
import { PROJECT_STATUSES } from '../../utils/constants.js';

const ProjectForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const {
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    reset,
  } = useForm({
    defaultValues: {
      project_name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (!isEdit) return;

    const loadProject = async () => {
      try {
        const response = await projectService.getById(id);
        const project = response.data.data;
        reset({
          project_name: project.project_name || '',
          description: project.description || '',
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          status: project.status || 'Active',
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load project.');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, isEdit, navigate, reset]);

  const title = useMemo(() => (isEdit ? 'Edit Project' : 'Create Project'), [isEdit]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await projectService.update(id, values);
        toast.success('Project updated successfully.');
      } else {
        await projectService.create(values);
        toast.success('Project created successfully.');
      }
      navigate('/projects');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save project.');
    }
  };

  if (loading) return <LoadingSpinner label="Loading project..." />;

  return (
    <div className="page-shell">
      <PageHeader title={title} description="Track project details, timelines, and delivery status.">
        <Link to="/projects" className="btn-secondary">
          Back to Projects
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="section-panel p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Project Name" error={errors.project_name}>
            <input
              className="form-input"
              placeholder="Internal HRMS Upgrade"
              {...register('project_name', { required: 'Project name is required.' })}
            />
          </FormField>
          <FormField label="Status" error={errors.status}>
            <select className="form-input" {...register('status', { required: 'Status is required.' })}>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Start Date" error={errors.start_date}>
            <input type="date" className="form-input" {...register('start_date', { required: 'Start date is required.' })} />
          </FormField>
          <FormField label="End Date" error={errors.end_date}>
            <input
              type="date"
              className="form-input"
              {...register('end_date', {
                required: 'End date is required.',
                validate: (value) => !getValues('start_date') || value >= getValues('start_date') || 'End date cannot be before start date.',
              })}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Description" error={errors.description}>
              <textarea
                rows="5"
                className="form-input resize-none"
                placeholder="Describe project scope, deliverables, and stakeholders."
                {...register('description')}
              />
            </FormField>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
          <Link to="/projects" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
