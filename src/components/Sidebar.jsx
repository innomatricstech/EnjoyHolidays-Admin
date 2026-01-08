import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Image, 
  Briefcase,
  GalleryVertical,
  ChevronRight,
  LogOut,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

const Sidebar = ({ mobileOpen, setMobileOpen, onCollapseChange }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [adminUser, setAdminUser] = useState(null);

  // Get admin user data from storage
  useEffect(() => {
    const getUserData = () => {
      // Check both localStorage and sessionStorage
      let userData = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
      
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          setAdminUser(parsedData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    getUserData();
    
    // Listen for storage changes (in case of login/logout in other tabs)
    const handleStorageChange = () => {
      getUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        setCollapsed(true);
        if (onCollapseChange) onCollapseChange(true);
      } else {
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState !== null) {
          const isCollapsed = savedState === 'true';
          setCollapsed(isCollapsed);
          if (onCollapseChange) onCollapseChange(isCollapsed);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onCollapseChange]);

  // Save collapsed state
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-collapsed', collapsed.toString());
      if (onCollapseChange) {
        onCollapseChange(collapsed);
      }
    }
  }, [collapsed, isMobile, onCollapseChange]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
      isActive
        ? "bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 text-yellow-400 border-l-4 border-yellow-400"
        : "hover:bg-gray-800 hover:text-yellow-300 hover:translate-x-1 text-gray-300"
    }`;

  const mainMenuItems = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/banner", label: "Banner", icon: <Image size={20} /> },
    { to: "/service", label: "Service", icon: <Briefcase size={20} /> },
    { to: "/gallery", label: "Gallery", icon: <GalleryVertical size={20} /> },
  ];

  const handleLinkClick = () => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  };

  const toggleCollapse = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isMobile) {
      const newCollapsed = !collapsed;
      setCollapsed(newCollapsed);
    }
  };

  // Get initials from name or email
  const getInitials = () => {
    if (!adminUser) return "E";
    
    if (adminUser.name) {
      return adminUser.name.charAt(0).toUpperCase();
    } else if (adminUser.email) {
      return adminUser.email.charAt(0).toUpperCase();
    }
    return "E";
  };

  // Get display name
  const getDisplayName = () => {
    if (!adminUser) return "Enjoyholidays";
    
    if (adminUser.name) {
      return adminUser.name;
    } else if (adminUser.email) {
      return adminUser.email.split('@')[0];
    }
    return "Enjoyholidays";
  };

  // Get display email
  const getDisplayEmail = () => {
    if (!adminUser) return "enjoyholidays@gmail.com";
    return adminUser.email || "enjoyholidays@gmail.com";
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    
    // Also clear any other stored tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear the state
    setAdminUser(null);
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block ${collapsed ? 'w-20' : 'w-64'} h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white border-r border-gray-800 shadow-2xl flex flex-col transition-all duration-300 fixed left-0 top-0 z-30`}
      >
        <div className="p-6 pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {!collapsed ? (
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-gray-400 text-sm mt-2">Manage your content</p>
              </div>
            ) : (
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent mx-auto">
                AP
              </h1>
            )}
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              type="button"
            >
              <ChevronRight 
                size={18} 
                className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>
        </div>

        {/* Admin User Info Section - MOVED ABOVE MAIN MENU */}
        <div className="p-6 border-b border-gray-800">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center font-bold">
                {getInitials()}
              </div>
              <div className="flex-1">
                <p className="font-medium">{getDisplayName()}</p>
                <p className="text-xs text-gray-400 truncate">{getDisplayEmail()}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center font-bold">
                {getInitials()}
              </div>
            </div>
          )}
          
          
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {!collapsed && (
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 px-3">
              Main Menu
            </h3>
          )}
          
          <ul className="space-y-1">
            {mainMenuItems.map((item) => (
              <li key={item.label}>
                <NavLink 
                  to={item.to} 
                  className={linkClass} 
                  onClick={handleLinkClick}
                  end
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight 
                        size={16}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-yellow-400" 
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 hover:translate-x-1 text-gray-300 group focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Logout"
            type="button"
          >
            <span className="group-hover:scale-110 transition-transform duration-300">
              <LogOut size={20} />
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Logout</span>
                <ChevronRight 
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-400" 
                />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside 
            className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-950 text-white shadow-2xl flex flex-col lg:hidden"
          >
            <div className="p-6 pb-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-gray-400 text-sm mt-2">Manage your content</p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Admin User Info Section - MOVED ABOVE MAIN MENU */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center font-bold">
                  {getInitials()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{getDisplayName()}</p>
                  <p className="text-xs text-gray-400 truncate">{getDisplayEmail()}</p>
                </div>
              </div>
              
              
            </div>

            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 px-3">
                Main Menu
              </h3>
              
              <ul className="space-y-1">
                {mainMenuItems.map((item) => (
                  <li key={item.label}>
                    <NavLink 
                      to={item.to} 
                      className={linkClass}
                      onClick={() => {
                        handleLinkClick();
                        setMobileOpen(false);
                      }}
                      end
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight 
                        size={16}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-yellow-400" 
                      />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-800">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 hover:translate-x-1 text-gray-300 group focus:outline-none focus:ring-2 focus:ring-red-500"
                type="button"
              >
                <span className="group-hover:scale-110 transition-transform duration-300">
                  <LogOut size={20} />
                </span>
                <span className="flex-1 text-left">Logout</span>
                <ChevronRight 
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-400" 
                />
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;