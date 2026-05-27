import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import NewTest from '../pages/NewTest.jsx';
import TestResults from '../pages/TestResults.jsx';
import Analytics from '../pages/Analytics.jsx';
import Collections from '../pages/Collections.jsx';
import Profile from '../pages/Profile.jsx';
import Settings from '../pages/Settings.jsx';

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/tests/new', element: <NewTest /> },
          { path: '/tests/:id', element: <TestResults /> },
          { path: '/analytics', element: <Analytics /> },
          { path: '/collections', element: <Collections /> },
          { path: '/profile', element: <Profile /> },
          { path: '/settings', element: <Settings /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
