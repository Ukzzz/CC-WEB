import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffService } from '../../services/staff.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StaffListPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, staff: null });
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchStaff();
  }, [pagination.page]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      setStaff(response.data.staff || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0,
      }));
    } catch (error) {
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchStaff();
  };

  const handleDelete = async () => {
    if (!deleteModal.staff) return;
    
    try {
      setDeleting(true);
      await staffService.delete(deleteModal.staff._id);
      toast.success('Staff member terminated successfully');
      setDeleteModal({ show: false, staff: null });
      fetchStaff();
    } catch (error) {
      toast.error('Failed to delete staff member');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (e, member) => {
    e.stopPropagation();
    setDeleteModal({ show: true, staff: member });
  };

  const getRoleBadge = (role) => {
    const roles = {
      doctor: 'badge-info',
      nurse: 'badge-success',
      admin: 'badge-primary',
      staff: 'badge-default',
      hospital_admin: 'badge-warning',
    };
    return roles[role] || 'badge-default';
  };

  const getRoleIcon = (role) => {
    const icons = {
      doctor: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.317 1.01-.504a1 1 0 01.894 1.788l-.394.197 1.436 4.794A2 2 0 0116 15h-1a2 2 0 01-1.9-2.606l-1.15-3.84L10 9.5l-1.95-.946-1.15 3.84A2 2 0 015 15H4a2 2 0 01-1.9-3.085l1.436-4.794-.394-.197a1 1 0 01.894-1.788l1.01.504L9 4.323V3a1 1 0 011-1z" />
        </svg>
      ),
      nurse: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
      ),
      admin: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
        </svg>
      ),
      hospital_admin: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      ),
      staff: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    };
    return icons[role] || icons.staff;
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 'badge-success' : 'badge-default';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? (
      <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
    ) : (
      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
    );
  };

  const formatRole = (role) => {
    return role?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Staff';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">Manage hospital staff members</p>
        </div>
        {hasPermission('create_staff') && (
          <button
            onClick={() => navigate('/staff/new')}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Staff
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body py-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search staff by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10"
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell pl-5">Name</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Hospital</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell pr-5"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 skeleton rounded-full" />
                        <div>
                          <div className="h-4 w-32 skeleton mb-1" />
                          <div className="h-3 w-24 skeleton" />
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><div className="h-5 w-16 skeleton rounded-full" /></td>
                    <td className="table-cell"><div className="h-4 w-24 skeleton" /></td>
                    <td className="table-cell"><div className="h-5 w-14 skeleton rounded-full" /></td>
                    <td className="table-cell pr-5"></td>
                  </tr>
                ))
              ) : staff.length > 0 ? (
                staff.map((member) => (
                  <tr
                    key={member._id}
                    className="table-row cursor-pointer"
                    onClick={() => navigate(`/staff/${member._id}/edit`)}
                  >
                    <td className="table-cell pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium">
                          {member.name?.firstName?.[0]}{member.name?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.name?.firstName} {member.name?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{member.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getRoleBadge(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {formatRole(member.role)}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600">
                      {member.hospital?.name || '-'}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusBadge(member.status)}`}>
                        {getStatusIcon(member.status)}
                        {member.status}
                      </span>
                    </td>
                    <td className="table-cell pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/staff/${member._id}/edit`);
                          }}
                          className="text-gray-400 hover:text-primary-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {hasPermission('manage_staff') && (
                          <button
                            onClick={(e) => openDeleteModal(e, member)}
                            className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="empty-state-icon mx-auto">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No staff members found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Terminate Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Terminate Staff Member</h3>
                <p className="text-sm text-gray-500">This will mark them as terminated</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to terminate <strong>{deleteModal.staff?.name?.firstName} {deleteModal.staff?.name?.lastName}</strong>? 
              Their status will be changed to "Terminated" and they will no longer appear in active staff lists.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, staff: null })}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-amber-600 hover:bg-amber-700 text-white"
                disabled={deleting}
              >
                {deleting ? 'Terminating...' : 'Terminate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffListPage;
