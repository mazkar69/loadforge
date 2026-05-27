import { Outlet, Navigate } from 'react-router-dom';
import { BeakerIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore.js';

const AuthLayout = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0f1117' }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BeakerIcon className="w-9 h-9" style={{ color: '#6366f1' }} />
          <span className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>LoadForge</span>
        </div>
        <div
          className="rounded-xl p-8"
          style={{ background: '#1e2130', border: '1px solid #2e3148' }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
