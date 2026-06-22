import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-soft">
      <p className="text-sm font-bold uppercase tracking-wide text-blue-600">404</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950">Page not found</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">The page you are looking for does not exist in this portal.</p>
      <Link to="/dashboard" className="btn-primary mt-6">
        Back to Dashboard
      </Link>
    </div>
  </main>
);

export default NotFound;
