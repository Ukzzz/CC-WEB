import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Add as Plus, Search, VerifiedUser as Shield, Business as Building } from '@mui/icons-material';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

const AdminsListPage = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await authService.getAdmins();
      // Ensure we extract the array correctly based on API response structure
      setAdmins(data.data.admins || []);
    } catch (error) {
      toast.error('Failed to load admins');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.name.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Admin Management</h1>
          <p className="page-subtitle">Manage system and hospital administrators</p>
        </div>
        <button
          onClick={() => navigate('/admins/new')}
          className="btn btn-primary"
        >
          <Plus />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading admins...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No admins found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                            {admin.name.firstName.charAt(0)}
                            {admin.name.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {admin.name.firstName} {admin.name.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Shield className={admin.role === 'super_admin' ? 'text-purple-500' : 'text-blue-500'} fontSize="small" />
                          <span className={`capitalize text-sm font-medium ${admin.role === 'super_admin' ? 'text-purple-700' : 'text-blue-700'}`}>
                            {admin.role.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Building fontSize="small" />
                          <span className="text-sm">
                            {admin.hospital ? admin.hospital.name : 'All Hospitals'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            admin.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminsListPage;
