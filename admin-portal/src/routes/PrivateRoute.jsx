import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredPermission, requiredRole }) => {
  const { isAuthenticated, loading, admin, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/splash" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (
    requiredRole &&
    admin.role !== requiredRole &&
    admin.role !== 'super_admin'
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
