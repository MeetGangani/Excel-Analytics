import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

function Header({ handleLogout }) {
  const navigate = useNavigate();
  const [searchActive, setSearchActive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New analysis available for your latest upload', time: '2 min ago', read: false },
    { id: 2, message: 'Weekly report generated', time: '1 hour ago', read: false },
    { id: 3, message: 'System update completed successfully', time: 'Yesterday', read: true }
  ]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white shadow z-10">
      <div className="flex justify-between items-center px-4 py-3">
        <div className={`relative ${searchActive ? 'w-full md:w-96' : 'w-64'} transition-all duration-300`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search files, charts, analytics..."
            onFocus={() => setSearchActive(true)}
            onBlur={() => setSearchActive(false)}
          />
        </div>
        <div className="flex items-center">
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (showUserMenu) setShowUserMenu(false);
              }}
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <BellIcon className="h-6 w-6 text-gray-500" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 rounded-full w-4 h-4 text-white text-xs flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-sm font-medium">Notifications</h3>
                  <button 
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-2 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">No notifications</p>
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button 
                    className="text-sm text-indigo-600 w-full text-center hover:text-indigo-800"
                    onClick={() => navigate('/dashboard/notifications')}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative ml-3">
            <button 
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                if (showNotifications) setShowNotifications(false);
              }}
              className="flex items-center text-sm rounded-full focus:outline-none"
            >
              <span className="sr-only">Open user menu</span>
              <UserCircleIcon className="h-8 w-8 text-gray-600" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                <a href="#settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header; 