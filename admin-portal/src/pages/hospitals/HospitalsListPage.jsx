import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospital.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const HospitalsListPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const menuRef = useRef(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.getAll();
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await hospitalService.deactivate(id);
      toast.success('Hospital deactivated');
      fetchHospitals();
      setOpenMenu(null);
    } catch (error) {
      toast.error('Failed to deactivate hospital');
    }
  };

  // Helper to get city safely
  const getCity = (hospital) => hospital.location?.city || hospital.city || '';
  const getState = (hospital) => hospital.location?.state || hospital.state || '';
  const getType = (hospital) => hospital.hospitalType || hospital.type || 'private';
  const getSpecializations = (hospital) => hospital.metadata?.specializations || hospital.specializations || [];

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(search.toLowerCase()) ||
    getCity(hospital).toLowerCase().includes(search.toLowerCase())
  );

  const getTypeConfig = (type) => {
    const configs = {
      public: { 
        gradient: 'from-blue-500 to-cyan-500', 
        bg: 'bg-blue-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: '🏛️'
      },
      private: { 
        gradient: 'from-purple-500 to-pink-500', 
        bg: 'bg-purple-50', 
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: '🏥'
      },
    };
    return configs[type] || configs.private;
  };

  const exportCSV = () => {
    const headers = ['Name', 'Code', 'Type', 'Status', 'City', 'State', 'Phone', 'Email'];
    const rows = filteredHospitals.map(h => [
      h.name, 
      h.code,
      getType(h), 
      h.status, 
      getCity(h), 
      getState(h),
      h.contact?.phone || '',
      h.contact?.email || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hospitals.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Hospitals</h1>
          <p className="page-subtitle">Manage and monitor all registered healthcare facilities</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* View Toggle */}
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <button onClick={exportCSV} className="btn btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          
          {hasPermission('create_hospital') && (
            <button onClick={() => navigate('/hospitals/new')} className="btn btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Hospital
            </button>
          )}
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search hospitals by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all outline-none"
            />
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"></div>
              <span className="text-gray-600">Active: <strong className="text-gray-900">{hospitals.filter(h => h.status === 'active').length}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-gray-600">Inactive: <strong className="text-gray-900">{hospitals.filter(h => h.status !== 'active').length}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Hospitals Display */}
      {loading ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-4"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-200" />
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredHospitals.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredHospitals.map((hospital, idx) => {
              const config = getTypeConfig(getType(hospital));
              return (
                <div
                  key={hospital._id}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
                  onClick={() => navigate(`/hospitals/${hospital._id}/edit`)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Gradient Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
                  
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Hospital Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {config.icon}
                      </div>
                      
                      {/* Hospital Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-emerald-600 transition-colors">
                            {hospital.name}
                          </h3>
                          <div className="relative flex-shrink-0" ref={openMenu === hospital._id ? menuRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === hospital._id ? null : hospital._id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                              </svg>
                            </button>
                            {openMenu === hospital._id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-20 animate-scale-in">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/hospitals/${hospital._id}/edit`);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit Details
                                </button>
                                {hasPermission('manage_hospitals') && hospital.status === 'active' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeactivate(hospital._id);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    Deactivate
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{getCity(hospital)}{getState(hospital) ? `, ${getState(hospital)}` : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
                        {getType(hospital)?.charAt(0).toUpperCase() + getType(hospital)?.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                        hospital.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${hospital.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {hospital.status?.charAt(0).toUpperCase() + hospital.status?.slice(1)}
                      </span>
                    </div>

                    {/* Specializations */}
                    {getSpecializations(hospital).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-1.5">
                          {getSpecializations(hospital).slice(0, 3).map((spec, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                              {spec}
                            </span>
                          ))}
                          {getSpecializations(hospital).length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md">
                              +{getSpecializations(hospital).length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHospitals.map((hospital) => {
                  const config = getTypeConfig(getType(hospital));
                  return (
                    <tr 
                      key={hospital._id} 
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/hospitals/${hospital._id}/edit`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-xl`}>
                            {config.icon}
                          </div>
                          <span className="font-semibold text-gray-900">{hospital.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{getCity(hospital)}{getState(hospital) ? `, ${getState(hospital)}` : ''}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                          {getType(hospital)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${
                          hospital.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${hospital.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                          {hospital.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/hospitals/${hospital._id}/edit`); }}
                          className="text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-4xl mb-5">
              🏥
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? 'No hospitals found' : 'No hospitals registered'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search ? 'Try adjusting your search terms' : 'Get started by adding your first hospital'}
            </p>
            {!search && hasPermission('create_hospital') && (
              <button onClick={() => navigate('/hospitals/new')} className="btn btn-primary">
                Add First Hospital
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalsListPage;
