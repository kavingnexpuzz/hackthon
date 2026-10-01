import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';

// Public Pages
import PublicHome from './pages/PublicHome';
import CoursesCatalog from './pages/CoursesCatalog';
import CollegeInfoPage from './pages/CollegeInfoPage';
import TrackComplaint from './pages/TrackComplaint';

// Auth Pages
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import DepartmentLogin from './pages/DepartmentLogin';
import Register from './pages/Register';

// Protected App Pages
import Dashboard from './pages/Dashboard';
import AiChat from './pages/AiChat';
import Complaints from './pages/Complaints';
import Requests from './pages/Requests';
import KnowledgeBase from './pages/KnowledgeBase';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import StaffDashboard from './pages/StaffDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { LoadingSpinner } from './components/common/EmptyState';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner label="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If trying to access admin route, redirect to admin login
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // If trying to access department route, redirect to department login
    if (location.pathname.startsWith('/department') || location.pathname.startsWith('/staff')) {
      return <Navigate to="/department/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* 1. Public College Assistant & Information Portal (No Forced Login!) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicHome />} />
        <Route path="/courses" element={<CoursesCatalog />} />
        <Route path="/college-info" element={<CollegeInfoPage />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/complaint/:ticketNumber" element={<TrackComplaint />} />
      </Route>

      {/* 2. Authentication Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/department/login" element={<DepartmentLogin />} />
      <Route path="/register" element={<Register />} />

      {/* 3. Protected Portals Wrapped in MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* User Portal */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<AiChat />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/faq" element={<KnowledgeBase />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />

        {/* Department Staff Portal */}
        <Route
          path="/department/dashboard"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <DepartmentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Administrator Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 4. 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
