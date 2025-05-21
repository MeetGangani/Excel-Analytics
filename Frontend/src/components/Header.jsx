import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout, reset } from '../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Debug the user object structure
  useEffect(() => {
    console.log("User object in Header:", user);
  }, [user]);

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

  return (
    <motion.header 
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="bg-blue-500 shadow-md fixed w-full top-0 z-50"
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
            <Link to="/" className="flex items-center">
              <motion.svg 
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="h-8 w-8 text-white" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 13H10V19H4V13Z" className="fill-white" />
                <path d="M4 5H10V11H4V5Z" className="fill-white opacity-70" />
                <path d="M12 5H18V11H12V5Z" className="fill-white" />
                <path d="M12 13H18V19H12V13Z" className="fill-white opacity-70" />
              </motion.svg>
              <span className="ml-2 text-xl font-bold text-white">Excel Analytics</span>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
                  {/* Profile dropdown button */}
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={toggleDropdown}
                  >
                    <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-xs font-medium hover:ring-2 hover:ring-white hover:ring-opacity-50 transition-all">
                      {user?.user?.name?.charAt(0) || user?.user?.email?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0)}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm text-white font-medium flex items-center">
                        {user?.user?.name || user?.user?.email?.split('@')[0] || user?.name || user?.email?.split('@')[0]}
                        <svg className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </p>
                    </div>
                  </div>
                  
                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-10 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20"
                      >
                        <div className="py-2">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user?.user?.name || user?.user?.email?.split('@')[0] || user?.name || user?.email?.split('@')[0]}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.user?.email || user?.email}</p>
                          </div>
                          
                          <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Dashboard
                          </Link>
                          
                          <Link to="/dashboard/files/manage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            My Files
                          </Link>
                          
                          <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Account Settings
                          </Link>
                          
                          <button 
                            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={onLogout}
                          >
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/login" 
                    className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/register" 
                    className="bg-white text-blue-500 hover:bg-gray-100 px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </motion.div>
              </>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button 
              className="text-white p-2" 
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
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden py-2 pb-4 space-y-2 bg-white mt-1 rounded-xl shadow-lg fade-in"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {user ? (
              <>
                {/* User Profile in Mobile Menu */}
                <div className="flex items-center px-4 py-3 border-b border-gray-100 mx-2">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                    {user?.user?.name?.charAt(0) || user?.user?.email?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.user?.name || user?.user?.email?.split('@')[0] || user?.name || user?.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500">{user?.user?.email || user?.email}</p>
                  </div>
                </div>
                
                <Link to="/dashboard" className="text-gray-900 hover:bg-gray-100 block px-4 py-2 rounded-lg mx-2 text-base font-medium">
                  Dashboard
                </Link>
                
                <Link to="/dashboard/files/manage" className="text-gray-900 hover:bg-gray-100 block px-4 py-2 rounded-lg mx-2 text-base font-medium">
                  My Files
                </Link>
                
                <Link to="#" className="text-gray-900 hover:bg-gray-100 block px-4 py-2 rounded-lg mx-2 text-base font-medium">
                  Account Settings
                </Link>
                
                <button 
                  className="w-full text-left text-gray-900 hover:bg-red-50 text-red-600 block px-4 py-2 rounded-lg mx-2 text-base font-medium"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-900 hover:bg-gray-100 block px-4 py-2 rounded-lg mx-2 text-base font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-gray-900 hover:bg-gray-100 block px-4 py-2 rounded-lg mx-2 text-base font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
