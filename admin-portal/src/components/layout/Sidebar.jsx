import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: 'Hospitals',
    path: '/hospitals',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    permission: 'view_hospitals',
  },
  {
    title: 'Staff Members',
    path: '/staff',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    permission: 'view_staff',
  },
  {
    title: 'Resources',
    path: '/resources',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    permission: 'view_resources',
  },
  {
    title: 'Manage Admins',
    path: '/admins',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    permission: 'super_admin',
  },
  {
    title: 'System Logs',
    path: '/logs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    permission: 'view_logs',
  },
  {
    title: 'Patient Feedback',
    path: '/feedback',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    permission: 'view_feedback',
  },
  {
    title: 'Help & Support',
    path: '/help',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      onClose?.();
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true;
    if (item.permission === 'super_admin') return user?.role === 'super_admin';
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] transform transition-transform duration-300 ease-premium md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #1a2332 0%, #131c28 100%)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* ── Logo Section ── */}
          <div className="flex items-center gap-3.5 px-6 py-6 border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-glow-accent">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide leading-none">
                Care<span className="text-accent-400">Connect</span>
              </h1>
              <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] mt-1">
                Admin Portal
              </p>
            </div>
          </div>

          {/* ── Navigation ── */}
          <nav className="flex-1 py-5 px-3 overflow-y-auto">
            <p className="px-4 mb-3 text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em]">
              Navigation
            </p>
            <ul className="space-y-1">
              {filteredMenuItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/');

                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`sidebar-item w-full group ${isActive ? 'active' : ''}`}
                    >
                      <span className={`transition-colors duration-200 ${isActive ? 'text-accent-400' : 'group-hover:text-accent-300'}`}>
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400 shadow-[0_0_8px_2px_rgba(34,181,152,0.4)]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── User Info ── */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors duration-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-semibold shadow-soft-sm ring-2 ring-white/10">
                {typeof user?.name === 'object'
                  ? (user?.name?.firstName?.charAt(0) || 'U')
                  : (user?.name?.charAt(0) || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate">
                  {typeof user?.name === 'object'
                    ? `${user?.name?.firstName || ''} ${user?.name?.lastName || ''}`.trim()
                    : (user?.name || 'User')}
                </p>
                <p className="text-[11px] text-white/35 truncate capitalize">
                  {user?.role?.replace('_', ' ') || 'Admin'}
                </p>
              </div>
              {/* Online indicator */}
              <span className="w-2 h-2 rounded-full bg-accent-400 shadow-[0_0_6px_1px_rgba(34,181,152,0.5)]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
