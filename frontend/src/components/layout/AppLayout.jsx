import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  HomeIcon,
  BoltIcon,
  ChartBarIcon,
  FolderIcon,
  UserIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  BeakerIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../../hooks/useAuth.js';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: '/tests/new', label: 'New Test', icon: BoltIcon },
  { path: '/analytics', label: 'Analytics', icon: ChartBarIcon },
  { path: '/collections', label: 'Collections', icon: FolderIcon },
  { path: '/profile', label: 'Profile', icon: UserIcon },
  { path: '/settings', label: 'Settings', icon: CogIcon },
];

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1117' }}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#1a1d27', borderRight: '1px solid #2e3148' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5" style={{ borderBottom: '1px solid #2e3148' }}>
          <BeakerIcon className="w-7 h-7" style={{ color: '#6366f1' }} />
          <span className="text-lg font-bold" style={{ color: '#e2e8f0' }}>LoadForge</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="w-5 h-5" style={{ color: '#94a3b8' }} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = pathname === path || (path !== '/' && pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: active ? '#818cf8' : '#94a3b8',
                }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid #2e3148' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: '#6366f1', color: 'white' }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: '#e2e8f0' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: '#64748b' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-500/10"
            style={{ color: '#94a3b8' }}
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar (mobile) */}
        <header
          className="flex items-center gap-3 px-4 py-3 lg:hidden"
          style={{ background: '#1a1d27', borderBottom: '1px solid #2e3148' }}
        >
          <button onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6" style={{ color: '#94a3b8' }} />
          </button>
          <BeakerIcon className="w-6 h-6" style={{ color: '#6366f1' }} />
          <span className="text-base font-bold" style={{ color: '#e2e8f0' }}>LoadForge</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
