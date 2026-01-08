import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken') || 
                    sessionStorage.getItem('adminToken');
      setIsAuthenticated(!!token);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Sync sidebar state with local storage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  const handleCollapseChange = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleToggleSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen}
        onCollapseChange={handleCollapseChange}
      />

      {/* Main content with dynamic margin */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <Navbar 
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Main content area with padding for mobile navbar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 pt-16 md:pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;