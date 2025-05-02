import { useState, useEffect, createContext } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Header from './components/Header';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard';

// Create Authentication Context
export const AuthContext = createContext();

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const user = localStorage.getItem('user');
    setIsAuthenticated(user !== null);

    // Create a function to handle storage events
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        setIsAuthenticated(e.newValue !== null);
      }
    };

    // Listen for storage events (for login/logout in other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Create a custom event listener for auth changes within the same tab
    const handleAuthChange = () => {
      const user = localStorage.getItem('user');
      setIsAuthenticated(user !== null);
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Login function to be passed to Login component
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('authChange'));
  };

  // Logout function to be passed to components that need it
  const logout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route 
            path='/dashboard' 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
