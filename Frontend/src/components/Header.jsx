import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, reset } from '../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';
import ProfileComponent from './ProfileComponent';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  // Debug the user object structure
  useEffect(() => {
    console.log("User object in Header:", user);
  }, [user]);

  // Let's also add the "Admin" role to user for development/testing
  useEffect(() => {
    if (user && user.user) {
      console.log("User role:", user.user.role);
    }
  }, [user]);
  
  // Check scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const openProfileModal = () => {
    setDropdownOpen(false);
    setProfileModalOpen(true);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if a nav link is active
  const isActive = (path) => {
    // Dashboard item
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    // Admin Dashboard item - should be active when /admin has no query params
    if (path === '/admin' && location.pathname === '/admin' && !location.search) {
      return true;
    }
    
    // For admin tabs with query parameters
    if (path.startsWith('/admin?') && location.pathname === '/admin') {
      return location.search === path.substring(path.indexOf('?'));
    }
    
    return location.pathname.startsWith(path) && path !== '/dashboard' && path !== '/admin';
  };

  // Navigation items for regular users
  const userNavItems = [
    {
      to: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      text: 'Dashboard'
    },
    {
      to: '/dashboard/files/upload',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      text: 'Upload'
    },
    {
      to: '/dashboard/files/analyze',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      text: 'Analyze'
    },
    {
      to: '/dashboard/files/quickanalyze',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      text: 'Quick Analysis'
    },
    {
      to: '/dashboard/files/visualize',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      text: 'Visualize'
    },
    {
      to: '/dashboard/files/manage',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      text: 'Files'
    }
  ];

  // Navigation items for admin users
  const adminNavItems = [
    {
      to: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      text: 'Dashboard'
    },
    {
      to: '/admin?tab=users',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      text: 'Users'
    },
    {
      to: '/admin?tab=files',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      text: 'Files'
    },
    {
      to: '/admin?tab=analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      text: 'Analytics'
    }
  ];

  // Determine which navigation items to display based on user role
  const getNavItems = () => {
    if (user?.user?.role === 'admin') {
      return adminNavItems;
    }
    return userNavItems;
  };

  return (
    <>
      <motion.header 
        initial={{ y: -70 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className={`fixed w-full top-0 z-50 transition-all duration-200 ${isScrolled ? 'glass-effect text-gray-800' : 'bg-primary-main text-white'}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex-shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link to={user?.user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center ${isScrolled ? 'bg-primary-main text-white' : 'bg-white text-primary-main'}`}
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 13H10V19H4V13Z" className="fill-current" />
                    <path d="M4 5H10V11H4V5Z" className="fill-current opacity-70" />
                    <path d="M12 5H18V11H12V5Z" className="fill-current" />
                    <path d="M12 13H18V19H12V13Z" className="fill-current opacity-70" />
                  </svg>
                </motion.div>
                <div className="ml-2.5">
                  <span className="text-lg font-bold">Excel Analytics</span>
                  <span className="hidden md:inline-block text-xs ml-1.5 opacity-80">v2.0</span>
                </div>
              </Link>
            </motion.div>
            
            {/* Desktop Navigation - Now positioned between logo and profile */}
            {user && (
              <nav className="hidden md:flex flex-1 items-center justify-center mx-4">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  {getNavItems().map((item) => (
                    <Link
                      key={item.to + item.text}
                      to={item.to}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center relative ${
                        isActive(item.to)
                          ? (isScrolled ? 'text-primary-main font-bold' : 'text-white font-bold')
                          : (isScrolled ? 'hover:text-primary-main text-gray-700' : 'hover:text-white text-white opacity-80')
                      }`}
                    >
                      <span className="mr-1.5">{item.icon}</span>
                      <span>{item.text}</span>
                      {isActive(item.to) && (
                        <span 
                          className={`absolute -bottom-1 left-0 h-0.5 ${isScrolled ? 'bg-primary-main' : 'bg-white'}`} 
                          style={{ 
                            animation: 'expandWidth 0.3s ease forwards',
                            width: '0%'
                          }}
                        ></span>
                      )}
                    </Link>
                  ))}
                </div>
              </nav>
            )}
              
            {/* User Profile/Auth Buttons */}
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
                  {/* Profile dropdown button */}
                  <motion.div 
                    className="flex items-center cursor-pointer"
                    onClick={toggleDropdown}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 text-sm font-medium ring-2 ${
                      isScrolled ? 'bg-primary-main text-white ring-white' : 'bg-white text-primary-main ring-transparent'
                    }`}>
                      {user?.user?.name?.charAt(0) || user?.user?.email?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0)}
                    </div>
                    <div className="hidden md:block">
                      <p className={`text-sm font-medium flex items-center ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                        {user?.user?.name || user?.user?.email?.split('@')[0] || user?.name || user?.email?.split('@')[0]}
                        <svg className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-10 mt-2 w-64 bg-white rounded-xl shadow-dropdown overflow-hidden z-20"
                      >
                        <div className="pb-1">
                          <div className="px-4 py-4 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">{user?.user?.name || user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{user?.user?.email || user?.email}</p>
                          </div>
                          
                          <div className="pt-2">
                            {user?.user?.role === 'admin' ? (
                              <>
                                <button onClick={openProfileModal} className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 text-left">
                                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Edit Profile
                                </button>
                                
                                <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50" onClick={() => setDropdownOpen(false)}>
                                  <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  Admin Dashboard
                                </Link>
                                <Link to="/admin?tab=users" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  Manage Users
                                </Link>
                                <Link to="/admin?tab=files" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  Manage Files
                                </Link>
                              </>
                            ) : (
                              <>
                                <button onClick={openProfileModal} className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 text-left">
                                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Edit Profile
                                </button>
                                
                                <Link to="/dashboard" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                  </svg>
                                  Dashboard
                                </Link>
                                
                                <Link to="/dashboard/files/manage" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                                  <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  My Files
                                </Link>
                                
                                {user?.user?.role === 'admin' && (
                                  <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50" onClick={() => setDropdownOpen(false)}>
                                    <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Admin Panel
                                  </Link>
                                )}
                              </>
                            )}
                            
                            <div className="border-t border-gray-100 my-1"></div>
                            
                            <button 
                              className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                              onClick={onLogout}
                            >
                              <svg className="w-4 h-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Button
                    variant="text"
                    size="sm"
                    className={isScrolled ? "text-gray-800" : "text-white"}
                    onClick={() => navigate('/login')}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant={isScrolled ? "primary" : "outlined"}
                    size="sm"
                    className={!isScrolled ? "border-white text-white hover:bg-white hover:bg-opacity-10" : ""}
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button 
                className={`p-2 rounded-md ${isScrolled ? 'text-gray-800' : 'text-white'}`}
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                whileTap={{ scale: 0.9 }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden py-2 pb-4 bg-white mt-1 shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-2 space-y-1">
                {user ? (
                  <>
                    {/* Mobile Navigation Menu */}
                    {getNavItems().map((item) => (
                      <Link 
                        key={item.to + item.text}
                        to={item.to}
                        className={`block px-3 py-2 rounded-md text-base font-medium relative ${
                          isActive(item.to)
                            ? 'text-primary-main font-bold'
                            : 'text-gray-700 hover:text-primary-main'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-2">{item.text}</span>
                        </div>
                        {isActive(item.to) && (
                          <span 
                            className={`absolute bottom-0 left-0 h-0.5 bg-primary-main`} 
                            style={{ 
                              animation: 'expandWidth 0.3s ease forwards',
                              width: '0%'
                            }}
                          ></span>
                        )}
                      </Link>
                    ))}
                    
                    <div className="pt-4 mt-2 border-t border-gray-200">
                      <div className="px-3 mb-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account</p>
                      </div>
                      
                      {user?.user?.role === 'admin' ? (
                        <>
                          <Link 
                            to="/admin" 
                            className="block px-3 py-2 rounded-md text-base font-medium text-indigo-700 hover:bg-indigo-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Admin Dashboard
                            </div>
                          </Link>
                          <Link 
                            to="/dashboard" 
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              User Dashboard
                            </div>
                          </Link>
                        </>
                      ) : (
                        <Link 
                          to="/dashboard" 
                          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                          </div>
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link 
                      to="/register" 
                      className="block px-3 py-2.5 rounded-md text-base font-medium bg-blue-500 text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      {/* Spacer to prevent content from hiding under the fixed header */}
      <div className="h-16"></div>
      {/* Profile Modal */}
      <ProfileComponent 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
    </>
  );
};

export default Header;
