import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[260px] transition-all duration-300 ease-premium flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} title={getPageTitle()} />
        
        <main className="flex-1 p-5 sm:p-7 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
