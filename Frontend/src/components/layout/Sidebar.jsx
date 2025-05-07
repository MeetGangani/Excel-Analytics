import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../App';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon, 
  Cog8ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

function Sidebar() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <ChartBarIcon className="w-5 h-5" /> },
    { name: 'Files', path: '/dashboard/files', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { name: 'Visualizations', path: '/dashboard/visualizations', icon: <ArrowTrendingUpIcon className="w-5 h-5" /> },
    { name: 'AI Analysis', path: '/dashboard/ai-analysis', icon: <PresentationChartLineIcon className="w-5 h-5" /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Cog8ToothIcon className="w-5 h-5" /> }
  ];

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-xl h-screen relative`}>
      <div className="p-4 flex items-center justify-between border-b border-indigo-700">
        {sidebarOpen ? (
          <h1 className="text-xl font-bold">Zidio Analytics</h1>
        ) : (
          <h1 className="text-xl font-bold">ZA</h1>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-indigo-700 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            {sidebarOpen ? (
              <path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10.25 4.75a.75.75 0 00-1.5 0v4.59l-1.95-2.1a.75.75 0 10-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V4.75z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>
      <nav className="mt-6">
        <ul>
          {navItems.map(item => (
            <li key={item.name} className="px-3 py-2 m-2">
              <Link 
                to={item.path}
                className={`flex items-center p-2 rounded-lg ${location.pathname === item.path ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-700 text-gray-200'} transition-all duration-200`}
              >
                <span className="mr-3">{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-indigo-700">
        {sidebarOpen && (
          <div className="flex items-center mb-4">
            <UserCircleIcon className="w-8 h-8 text-gray-200" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-300">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-gray-200 hover:bg-indigo-700 rounded-lg transition"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          {sidebarOpen && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar; 