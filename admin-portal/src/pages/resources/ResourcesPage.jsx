import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '../../services/resource.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHospitals, setExpandedHospitals] = useState({});
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'flat'

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getAll();
      const fetchedResources = response.data.resources || [];
      setResources(fetchedResources);
      
      // Auto-expand all hospitals initially
      const expanded = {};
      fetchedResources.forEach(r => {
        if (r.hospital?._id) {
          expanded[r.hospital._id] = true;
        }
      });
      setExpandedHospitals(expanded);
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  // Group resources by hospital
  const groupedResources = useMemo(() => {
    const groups = {};
    resources.forEach(resource => {
      const hospitalId = resource.hospital?._id || 'unassigned';
      const hospitalName = resource.hospital?.name || 'Unassigned';
      
      if (!groups[hospitalId]) {
        groups[hospitalId] = {
          hospitalId,
          hospitalName,
          hospitalCity: resource.hospital?.city || '',
          resources: []
        };
      }
      groups[hospitalId].resources.push(resource);
    });
    return Object.values(groups).sort((a, b) => a.hospitalName.localeCompare(b.hospitalName));
  }, [resources]);

  const toggleHospital = (hospitalId) => {
    setExpandedHospitals(prev => ({
      ...prev,
      [hospitalId]: !prev[hospitalId]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    groupedResources.forEach(g => { allExpanded[g.hospitalId] = true; });
    setExpandedHospitals(allExpanded);
  };

  const collapseAll = () => {
    setExpandedHospitals({});
  };

  const getResourceConfig = (type) => {
    const configs = {
      beds: { 
        gradient: 'from-blue-500 to-indigo-500', 
        bg: 'bg-blue-50', 
        icon: '🛏️',
        label: 'General Beds'
      },
      icu_beds: { 
        gradient: 'from-red-500 to-pink-500', 
        bg: 'bg-red-50', 
        icon: '🏥',
        label: 'ICU Beds'
      },
      ventilators: { 
        gradient: 'from-purple-500 to-violet-500', 
        bg: 'bg-purple-50', 
        icon: '🫁',
        label: 'Ventilators'
      },
      oxygen: { 
        gradient: 'from-cyan-500 to-teal-500', 
        bg: 'bg-cyan-50', 
        icon: '💨',
        label: 'Oxygen Supply'
      },
      blood_units: { 
        gradient: 'from-rose-500 to-red-500', 
        bg: 'bg-rose-50', 
        icon: '🩸',
        label: 'Blood Units'
      },
    };
    return configs[type] || { 
      gradient: 'from-gray-500 to-slate-500', 
      bg: 'bg-gray-50', 
      icon: '📦',
      label: type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Resource'
    };
  };

  const getPercentage = (available, total) => {
    if (total === 0) return 0;
    return Math.round((available / total) * 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage <= 20) return { bar: 'from-red-500 to-rose-500', text: 'text-red-600', label: 'Critical' };
    if (percentage <= 50) return { bar: 'from-amber-500 to-orange-500', text: 'text-amber-600', label: 'Low' };
    return { bar: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', label: 'Good' };
  };

  const canEdit = (resource) => {
    if (hasPermission('manage_resources')) return true;
    if (hasPermission('update_own_resources') && resource.hospital?._id === user?.hospital) return true;
    return false;
  };

  // Calculate totals for a hospital
  const getHospitalStats = (resources) => {
    const totalAvailable = resources.reduce((sum, r) => sum + (r.available || 0), 0);
    const totalCapacity = resources.reduce((sum, r) => sum + (r.total || 0), 0);
    const criticalCount = resources.filter(r => getPercentage(r.available, r.total) <= 20).length;
    return { totalAvailable, totalCapacity, criticalCount };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            Resources
          </h1>
          <p className="text-gray-500 mt-1">Monitor and manage hospital resources in real-time</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* View Toggle */}
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'grouped' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" />
              </svg>
              Grouped
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'flat' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
          </div>

          {viewMode === 'grouped' && (
            <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
              <button onClick={expandAll} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                Expand All
              </button>
              <button onClick={collapseAll} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                Collapse All
              </button>
            </div>
          )}

          <button onClick={fetchResources} className="btn btn-secondary" disabled={loading}>
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
          {hasPermission('manage_resources') && (
            <button onClick={() => navigate('/resources/new')} className="btn btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Resource
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20">
              🏥
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{groupedResources.length}</p>
              <p className="text-sm text-gray-500">Hospitals</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20">
              📦
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
              <p className="text-sm text-gray-500">Resources</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl shadow-lg shadow-green-500/20">
              ✅
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resources.reduce((sum, r) => sum + (r.available || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white text-xl shadow-lg shadow-red-500/20">
              ⚠️
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resources.filter(r => getPercentage(r.available, r.total) <= 20).length}
              </p>
              <p className="text-sm text-gray-500">Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Display */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-gray-100 rounded-xl" />
                <div className="h-24 bg-gray-100 rounded-xl" />
                <div className="h-24 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : resources.length > 0 ? (
        viewMode === 'grouped' ? (
          // Grouped View
          <div className="space-y-4">
            {groupedResources.map((group) => {
              const stats = getHospitalStats(group.resources);
              const isExpanded = expandedHospitals[group.hospitalId];
              
              return (
                <div key={group.hospitalId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Hospital Header */}
                  <button
                    onClick={() => toggleHospital(group.hospitalId)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg">
                        🏥
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900">{group.hospitalName}</h3>
                        <p className="text-sm text-gray-500">{group.hospitalCity} • {group.resources.length} resource types</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {/* Quick Stats */}
                      <div className="hidden sm:flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-gray-600">{stats.totalAvailable} available</span>
                        </div>
                        {stats.criticalCount > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-red-600 font-medium">{stats.criticalCount} critical</span>
                          </div>
                        )}
                      </div>
                      {/* Expand Icon */}
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Resources Grid (Collapsible) */}
                  <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                        {group.resources.map((resource) => {
                          const config = getResourceConfig(resource.resourceType);
                          const percentage = getPercentage(resource.available, resource.total);
                          const status = getStatusColor(percentage);
                          
                          return (
                            <div
                              key={resource._id}
                              onClick={() => navigate(`/resources/${resource._id}/edit`)}
                              className="group bg-gray-50/50 hover:bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-200"
                            >
                              {/* Resource Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-lg shadow-md`}>
                                    {config.icon}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                      {config.label}
                                    </h4>
                                  </div>
                                </div>
                                <span className={`text-xs font-bold ${status.text} px-2 py-0.5 rounded-full ${config.bg}`}>
                                  {status.label}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-500">Availability</span>
                                  <span className={`font-bold ${status.text}`}>{percentage}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full bg-gradient-to-r ${status.bar} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>

                              {/* Stats Row */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="text-center py-2 bg-emerald-50 rounded-lg">
                                  <p className="text-lg font-bold text-emerald-700">{resource.available}</p>
                                  <p className="text-[10px] text-emerald-600 uppercase font-medium">Free</p>
                                </div>
                                <div className="text-center py-2 bg-amber-50 rounded-lg">
                                  <p className="text-lg font-bold text-amber-700">{resource.occupied}</p>
                                  <p className="text-[10px] text-amber-600 uppercase font-medium">Used</p>
                                </div>
                                <div className="text-center py-2 bg-gray-100 rounded-lg">
                                  <p className="text-lg font-bold text-gray-700">{resource.total}</p>
                                  <p className="text-[10px] text-gray-500 uppercase font-medium">Total</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Flat Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {resources.map((resource) => {
              const config = getResourceConfig(resource.resourceType);
              const percentage = getPercentage(resource.available, resource.total);
              const status = getStatusColor(percentage);
              
              return (
                <div
                  key={resource._id}
                  onClick={() => navigate(`/resources/${resource._id}/edit`)}
                  className="group bg-white rounded-2xl p-5 shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-xl shadow-lg`}>
                        {config.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {config.label}
                        </h4>
                        <p className="text-xs text-gray-500">{resource.hospital?.name}</p>
                      </div>
                    </div>
                    {canEdit(resource) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/resources/${resource._id}/edit`); }}
                        className="text-gray-400 hover:text-emerald-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-500">Availability</span>
                      <span className={`font-bold ${status.text}`}>{percentage}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${status.bar} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center py-2.5 bg-emerald-50 rounded-xl">
                      <p className="text-xl font-bold text-emerald-700">{resource.available}</p>
                      <p className="text-xs text-emerald-600">Available</p>
                    </div>
                    <div className="text-center py-2.5 bg-amber-50 rounded-xl">
                      <p className="text-xl font-bold text-amber-700">{resource.occupied}</p>
                      <p className="text-xs text-amber-600">Occupied</p>
                    </div>
                    <div className="text-center py-2.5 bg-gray-100 rounded-xl">
                      <p className="text-xl font-bold text-gray-700">{resource.total}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-4xl mb-5">
              📦
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first resource</p>
            {hasPermission('manage_resources') && (
              <button onClick={() => navigate('/resources/new')} className="btn btn-primary">
                Add First Resource
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
