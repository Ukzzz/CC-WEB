import { useState, useEffect } from 'react';
import { logService } from '../../services/log.service';
import toast from 'react-hot-toast';

const SystemLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logService.getLogs({ page, limit: 15 });
      setLogs(response.data.logs);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="page-title">System Logs</h1>
           <p className="page-subtitle">Audit trail of system activities</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary">
          <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>User</th>
                <th>Role</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton w-32 h-4"></div></td>
                    <td><div className="skeleton w-24 h-4"></div></td>
                    <td><div className="skeleton w-32 h-4"></div></td>
                    <td><div className="skeleton w-20 h-4"></div></td>
                    <td><div className="skeleton w-48 h-4"></div></td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-info">{log.action}</span>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900">{log.user?.name}</div>
                      <div className="text-xs text-gray-500">{log.user?.email}</div>
                    </td>
                    <td className="capitalize text-sm text-gray-600">
                      {log.user?.role?.replace('_', ' ')}
                    </td>
                    <td className="text-sm text-gray-500 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
           <button 
             className="btn btn-secondary text-xs" 
             disabled={page === 1} 
             onClick={() => setPage(p => Math.max(1, p - 1))}
           >
             Previous
           </button>
           <span className="flex items-center text-sm font-medium text-gray-600">
             Page {page} of {totalPages}
           </span>
           <button 
             className="btn btn-secondary text-xs" 
             disabled={page === totalPages} 
             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
           >
             Next
           </button>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsPage;
