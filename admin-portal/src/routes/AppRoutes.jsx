import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../components/layout/MainLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import SplashScreen from '../pages/auth/SplashScreen';
import DashboardPage from '../pages/dashboard/DashboardPage';
import HospitalsListPage from '../pages/hospitals/HospitalsListPage';
import HospitalFormPage from '../pages/hospitals/HospitalFormPage';
import StaffListPage from '../pages/staff/StaffListPage';
import StaffFormPage from '../pages/staff/StaffFormPage';
import ResourcesPage from '../pages/resources/ResourcesPage';
import ResourceFormPage from '../pages/resources/ResourceFormPage';
import AdminsListPage from '../pages/admins/AdminsListPage';
import AdminFormPage from '../pages/admins/AdminFormPage';
import SystemLogsPage from '../pages/logs/SystemLogsPage';
import FeedbackPage from '../pages/feedback/FeedbackPage';
import HelpPage from '../pages/help/HelpPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Hospitals */}
        <Route path="hospitals" element={<HospitalsListPage />} />
        <Route
          path="hospitals/new"
          element={
            <PrivateRoute requiredRole="super_admin">
              <HospitalFormPage />
            </PrivateRoute>
          }
        />
        <Route path="hospitals/:id/edit" element={<HospitalFormPage />} />

        {/* Staff */}
        <Route path="staff" element={<StaffListPage />} />
        <Route
          path="staff/new"
          element={
            <PrivateRoute requiredPermission="manage_staff">
              <StaffFormPage />
            </PrivateRoute>
          }
        />
        <Route path="staff/:id/edit" element={<StaffFormPage />} />

        {/* Resources */}
        <Route path="resources" element={<ResourcesPage />} />
        <Route
          path="resources/new"
          element={
            <PrivateRoute requiredPermission="manage_resources">
              <ResourceFormPage />
            </PrivateRoute>
          }
        />
        <Route path="resources/:id/edit" element={<ResourceFormPage />} />

        {/* Admins (Super Admin Only) */}
        <Route
          path="admins"
          element={
            <PrivateRoute requiredRole="super_admin">
              <AdminsListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="admins/new"
          element={
            <PrivateRoute requiredRole="super_admin">
              <AdminFormPage />
            </PrivateRoute>
          }
        />

        {/* System Logs (Super Admin and Auditors) */}
        <Route
          path="logs"
          element={
            <PrivateRoute requiredPermission="view_logs">
              <SystemLogsPage />
            </PrivateRoute>
          }
        />

        {/* Feedback */}
        <Route path="feedback" element={<FeedbackPage />} />

        {/* Help */}
        <Route path="help" element={<HelpPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
