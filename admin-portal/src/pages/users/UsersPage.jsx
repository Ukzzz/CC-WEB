import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async (searchQuery = '') => {
    try {
      setLoading(true);
      const response = await userService.getAll({
        search: searchQuery,
        page,
        limit,
      });
      setUsers(response.data.data.users);
      setTotal(response.data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length >= 2 || value.length === 0) {
      setPage(1);
      fetchUsers(value);
    }
  };

  const handleStatusChange = async (user, newStatus) => {
    try {
      await userService.updateStatus(user._id, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchUsers(search);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive':
      case 'suspended': return 'badge-danger';
      case 'pending_verification': return 'badge-warning';
      default: return 'badge-default';
    }
  };

  const canManage = hasPermission('manage_users');
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage mobile app users</p>
        </div>
        
        {canManage && (
          <button
            onClick={() => navigate('/users/new')}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearch}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">User</th>
                <th className="table-header-cell">Phone</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Registered</th>
                {canManage && <th className="table-header-cell text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-36 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse" /></td>
                    <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
                    {canManage && <td className="table-cell"><div className="h-4 bg-gray-200 rounded w-8 ml-auto animate-pulse" /></td>}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="table-cell text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {user.profile?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </p>
                          {user.profile?.bloodGroup && (
                            <p className="text-xs text-gray-500">{user.profile.bloodGroup}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{user.phone}</td>
                    <td className="table-cell">{user.email || '-'}</td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusBadge(user.status)}`}>
                        {user.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    {canManage && (
                      <td className="table-cell text-right">
                        {user.status !== 'active' ? (
                          <button
                            onClick={() => handleStatusChange(user, 'active')}
                            className="text-xs text-success-600 hover:text-success-700 font-medium"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(user, 'inactive')}
                            className="text-xs text-danger-600 hover:text-danger-700 font-medium"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
