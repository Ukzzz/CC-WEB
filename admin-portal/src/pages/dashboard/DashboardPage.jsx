import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const StatCard = ({ title, value, subtitle, icon, color, loading, delay = 0 }) => {
  const colorStyles = {
    purple: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      ring: 'ring-violet-100',
      gradient: 'from-violet-500 to-purple-600',
      glow: 'shadow-violet-500/15',
    },
    cyan: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      ring: 'ring-cyan-100',
      gradient: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/15',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      ring: 'ring-emerald-100',
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'shadow-emerald-500/15',
    },
    orange: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      ring: 'ring-amber-100',
      gradient: 'from-orange-500 to-amber-600',
      glow: 'shadow-orange-500/15',
    },
  };

  const c = colorStyles[color] || colorStyles.green;

  return (
    <div
      className="stat-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">
              {title}
            </p>
            {loading ? (
              <div className="h-9 w-28 skeleton mt-1" />
            ) : (
              <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">
                {value?.toLocaleString() || 0}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs font-normal text-surface-400 mt-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-surface-300" />
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-lg ${c.glow} transition-all duration-300 group-hover:-translate-y-0.5`}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceRow = ({ type, total, available, occupied, index }) => {
  const percentage = total > 0 ? Math.round((available / total) * 100) : 0;

  const formatType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusColor = () => {
    if (percentage <= 20) return 'from-danger-400 to-danger-500';
    if (percentage <= 50) return 'from-warning-400 to-warning-500';
    return 'from-accent-400 to-accent-500';
  };

  const getStatusBadge = () => {
    if (percentage <= 20) return { text: 'Critical', class: 'badge-danger' };
    if (percentage <= 50) return { text: 'Moderate', class: 'badge-warning' };
    return { text: 'Healthy', class: 'badge-success' };
  };

  const badge = getStatusBadge();

  return (
    <tr
      className="table-row animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <td className="table-cell font-semibold text-surface-900 capitalize">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          {formatType(type)}
        </div>
      </td>
      <td className="table-cell">
        <span className="font-bold text-accent-600">{available}</span>
      </td>
      <td className="table-cell">
        <span className="font-medium text-warning-600">{occupied}</span>
      </td>
      <td className="table-cell text-surface-600 font-medium">{total}</td>
      <td className="table-cell">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getStatusColor()} transition-all duration-700 ease-premium`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className={`badge ${badge.class} text-[10px]`}>
            {badge.text}
          </span>
        </div>
      </td>
    </tr>
  );
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [resourceSummary, setResourceSummary] = useState([]);

  const socket = useSocket();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('resourceUpdated', (data) => {
        fetchDashboardData();
        toast.success(`Resource ${data.type}d: dashboard updated`);
      });

      return () => {
        socket.off('resourceUpdated');
      };
    }
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, resourceRes] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getResourceSummary(),
      ]);

      setStats(overviewRes.data);
      setResourceSummary(resourceRes.data.summary || []);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="page-title text-[26px]">Dashboard Overview</h1>
          <p className="page-subtitle mt-1.5">Welcome back — here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-medium text-surface-500 bg-white px-4 py-2 rounded-xl border border-surface-100/80 shadow-soft-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" />
          </span>
          Live Updates
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-6`}>
        <StatCard
          title="Total Hospitals"
          value={stats?.hospitals?.total}
          subtitle={`${stats?.hospitals?.active || 0} active currently`}
          loading={loading}
          color="purple"
          delay={0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        {!isSuperAdmin && (
          <StatCard
            title="Medical Staff"
            value={stats?.staff?.doctors + (stats?.staff?.nurses || 0)}
            subtitle={`${stats?.staff?.doctors || 0} Doctors · ${stats?.staff?.nurses || 0} Nurses`}
            loading={loading}
            color="cyan"
            delay={80}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        )}
        {!isSuperAdmin && (
          <StatCard
            title="Available Beds"
            value={stats?.beds?.available}
            subtitle={`${Math.round((stats?.beds?.available / stats?.beds?.total) * 100) || 0}% Availability`}
            loading={loading}
            color="green"
            delay={160}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
          />
        )}
        <StatCard
          title="Active Users"
          value={stats?.users?.active}
          subtitle="Using the mobile app"
          loading={loading}
          color="orange"
          delay={isSuperAdmin ? 80 : 240}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>

      {/* ── Resource Table (hospital admin only) ── */}
      {!isSuperAdmin && (
      <div className="table-container animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="px-7 py-6 border-b border-surface-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-surface-900">Resource Availability</h2>
            <p className="text-sm text-surface-500 mt-1 font-normal">
              Real-time status of critical hospital resources
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary btn-sm"
            disabled={loading}
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div>
          {loading && resourceSummary.length === 0 ? (
            <div className="p-7 space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 skeleton rounded-lg" />
                  <div className="flex-1 h-4 skeleton" />
                  <div className="w-16 h-4 skeleton" />
                  <div className="w-32 h-4 skeleton" />
                </div>
              ))}
            </div>
          ) : resourceSummary.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell pl-7">Resource Type</th>
                    <th className="table-header-cell">Available</th>
                    <th className="table-header-cell">Occupied</th>
                    <th className="table-header-cell">Total</th>
                    <th className="table-header-cell pr-7 w-1/3">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {resourceSummary.map((resource, index) => (
                    <ResourceRow
                      key={resource._id}
                      type={resource._id}
                      total={resource.total}
                      available={resource.available}
                      occupied={resource.occupied}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="empty-state-title">No resources found</p>
              <p className="empty-state-description">
                Add resources to see them tracked here.
              </p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default DashboardPage;
