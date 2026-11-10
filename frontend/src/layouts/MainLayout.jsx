import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="jt-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="jt-main-area">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="jt-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
