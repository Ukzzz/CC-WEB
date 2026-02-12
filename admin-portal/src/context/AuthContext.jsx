import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

// Role-based default permissions (must match backend)
const ROLE_PERMISSIONS = {
  super_admin: ['manage_hospitals', 'manage_staff', 'manage_resources', 'view_users', 'manage_users', 'view_analytics', 'view_staff', 'view_resources', 'view_hospitals', 'view_feedback', 'view_logs', 'manage_shifts'],
  hospital_admin: ['manage_staff', 'manage_resources', 'view_users', 'view_analytics', 'view_staff', 'view_resources', 'view_hospitals', 'view_feedback', 'manage_shifts'],
  staff_manager: ['manage_staff', 'manage_shifts', 'view_staff', 'view_resources', 'view_hospitals'],
  read_only_auditor: ['view_staff', 'view_resources', 'view_hospitals', 'view_feedback', 'view_logs', 'view_analytics']
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadAdminProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadAdminProfile = async () => {
    try {
      const response = await authService.getProfile();
      setAdmin(response.data.admin);
    } catch (error) {
      console.error('Failed to load profile:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { admin: adminData, accessToken, refreshToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setAdmin(adminData);
    
    return response;
  };

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAdmin(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permission) => {
      if (!admin) return false;
      if (admin.role === 'super_admin') return true;
      
      // Get role-based permissions
      const rolePermissions = ROLE_PERMISSIONS[admin.role] || [];
      const allPermissions = [...rolePermissions, ...(admin.permissions || [])];
      
      return allPermissions.includes(permission);
    },
    [admin]
  );

  const isSuperAdmin = useCallback(() => {
    return admin?.role === 'super_admin';
  }, [admin]);

  const isReadOnly = useCallback(() => {
    return admin?.role === 'read_only_auditor';
  }, [admin]);

  const canWrite = useCallback(() => {
    return admin && admin.role !== 'read_only_auditor';
  }, [admin]);

  const value = {
    admin,
    user: admin, // Alias for compatibility with components expecting 'user'
    token: localStorage.getItem('accessToken'), // Expose token for socket
    loading,
    isAuthenticated: !!admin,
    login,
    logout,
    hasPermission,
    isSuperAdmin,
    isReadOnly,
    canWrite,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
