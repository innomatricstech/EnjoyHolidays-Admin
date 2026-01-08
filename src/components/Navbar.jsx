import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar, sidebarCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg px-4 py-3 md:px-6 z-40 transition-all duration-300 ${
      sidebarCollapsed ? 'lg:w-[calc(100%-5rem)]' : 'lg:w-[calc(100%-16rem)]'
    } w-full lg:left-auto lg:right-0`}>
      <div className="flex justify-between items-center">
        {/* Mobile Hamburger Menu */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label="Toggle menu"
          type="button"
        >
          <Menu size={24} />
        </button>

        {/* Dashboard Title */}
        <h2 className="font-bold text-xl md:text-2xl text-white ml-2 lg:ml-0">
          Dashboard
        </h2>

        {/* Desktop Logout Button */}
        <button 
          onClick={handleLogout}
          className="hidden lg:flex items-center space-x-2 bg-white/20 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30"
          type="button"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>

        {/* Mobile Logout Button */}
        <button 
          onClick={handleLogout}
          className="lg:hidden p-2 rounded-lg hover:bg-red-500 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label="Logout"
          type="button"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;