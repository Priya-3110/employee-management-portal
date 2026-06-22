import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'D' },
  { to: '/employees', label: 'Employees', icon: 'E' },
  { to: '/projects', label: 'Projects', icon: 'P' },
  { to: '/assignments', label: 'Assignments', icon: 'A' },
];

const SidebarContent = ({ onClose }) => (
  <div className="flex h-full flex-col bg-blue-700 text-white">
    <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-blue-700">EP</div>
      <div>
        <p className="text-sm font-bold leading-tight">Employee Portal</p>
        <p className="text-xs text-blue-100">Management Suite</p>
      </div>
    </div>
    <nav className="flex-1 space-y-1 px-4 py-6">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
              isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-50 hover:bg-white/10'
            }`
          }
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-xs font-black">
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
    <div className="border-t border-white/10 p-4">
      <div className="rounded-lg bg-white/10 p-4">
        <p className="text-sm font-bold">Admin access</p>
        <p className="mt-1 text-xs leading-5 text-blue-100">Manage employee records, delivery work, and assignments.</p>
      </div>
    </div>
  </div>
);

const Sidebar = ({ open, onClose }) => (
  <>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
      <SidebarContent />
    </aside>
    {open ? (
      <div className="fixed inset-0 z-50 lg:hidden">
        <button type="button" className="absolute inset-0 bg-slate-950/50" onClick={onClose} aria-label="Close sidebar" />
        <aside className="relative h-full w-72 max-w-[85vw]">
          <SidebarContent onClose={onClose} />
        </aside>
      </div>
    ) : null}
  </>
);

export default Sidebar;
