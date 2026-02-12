import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    const firstName = user.name.firstName || user.name;
    return typeof firstName === 'string' ? firstName.charAt(0).toUpperCase() : 'U';
  };

  const getDisplayName = () => {
    if (!user?.name) return 'User';
    if (typeof user.name === 'string') return user.name;
    return `${user.name.firstName || ''} ${user.name.lastName || ''}`.trim() || 'User';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-surface-100/60">
      <div className="flex items-center justify-between px-5 sm:px-8 h-16">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100/60 rounded-xl transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 px-2.5 py-1.5 rounded-xl hover:bg-surface-100/50 transition-all duration-200"
          >
            <div className="avatar avatar-sm">
              {getInitials()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-surface-900">{getDisplayName()}</p>
              <p className="text-[11px] text-surface-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <svg
              className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="dropdown-menu right-0 w-56">
              <div className="px-5 py-4 border-b border-surface-100/60">
                <p className="text-sm font-semibold text-surface-900">{getDisplayName()}</p>
                <p className="text-xs text-surface-500 mt-0.5">{user?.email}</p>
              </div>
              <div className="py-1.5">
                <button
                  onClick={handleLogout}
                  className="dropdown-item dropdown-item-danger w-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
