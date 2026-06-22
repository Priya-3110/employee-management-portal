import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const titleMap = [
  ['/dashboard', 'Dashboard'],
  ['/employees', 'Employee Management'],
  ['/projects', 'Project Management'],
  ['/assignments', 'Assignments'],
];

const Navbar = ({ onMenuClick }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = useMemo(() => {
    const match = titleMap.find(([path]) => location.pathname.startsWith(path));
    return match ? match[1] : 'Employee Portal';
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
            aria-label="Open sidebar"
          >
            <span className="text-xl leading-none">=</span>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">HRMS Portal</p>
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.email || 'Admin'}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role || 'admin'}</p>
          </div>
          <button type="button" onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
