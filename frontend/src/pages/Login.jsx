import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm({
    defaultValues: {
      email: 'admin@example.com',
      password: 'admin123',
    },
  });

  useEffect(() => {
    setFocus('email');
  }, [setFocus]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success('Welcome back.');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <main className="flex min-h-screen bg-slate-100">
      <section className="hidden flex-1 bg-blue-700 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-base font-black text-blue-700">EP</div>
          <div>
            <p className="text-lg font-black">Employee Portal</p>
            <p className="text-sm text-blue-100">Project and workforce operations</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">Corporate HRMS dashboard</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">
            Manage employees, projects, and assignments from one workspace.
          </h1>
          <p className="mt-5 text-lg leading-8 text-blue-50">
            A clean full-stack portal built with React, Express, JWT, Sequelize, and MySQL.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {['JWT Auth', 'CRUD Modules', 'Responsive UI'].map((item) => (
            <div key={item} className="rounded-lg bg-white/10 p-4 font-bold">
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Admin Login</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Use the default admin account or your seeded admin credentials.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <label className="block">
              <span className="form-label">Email</span>
              <input
                type="email"
                className="form-input"
                placeholder="admin@example.com"
                {...register('email', {
                  required: 'Email is required.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address.',
                  },
                })}
              />
              {errors.email ? <span className="mt-1 block text-xs font-medium text-red-600">{errors.email.message}</span> : null}
            </label>
            <label className="block">
              <span className="form-label">Password</span>
              <input
                type="password"
                className="form-input"
                placeholder="admin123"
                {...register('password', {
                  required: 'Password is required.',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters.',
                  },
                })}
              />
              {errors.password ? (
                <span className="mt-1 block text-xs font-medium text-red-600">{errors.password.message}</span>
              ) : null}
            </label>
            <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-bold text-slate-800">Default admin</p>
            <p className="mt-1">Email: admin@example.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
