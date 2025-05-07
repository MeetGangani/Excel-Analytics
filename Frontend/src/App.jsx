import { useState, useEffect, createContext } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import FileUpload from './components/FileUpload';
import AIAnalysis from './components/AIAnalysis';
import Visualizations from './components/Visualizations';

// Create Authentication Context
export const AuthContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {}
});

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? children : <Navigate to="/" />;
};

// PublicRoute component to redirect authenticated users away from public pages
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
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
        <Routes>
          <Route path='/' element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path='/register' element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:resetToken' element={<ResetPassword />} />
          
          {/* Dashboard and related routes */}
          <Route 
            path='/dashboard' 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path='/dashboard/files' 
            element={
              <PrivateRoute>
                <FileUpload />
              </PrivateRoute>
            } 
          />
          <Route 
            path='/dashboard/visualizations' 
            element={
              <PrivateRoute>
                <Visualizations />
              </PrivateRoute>
            } 
          />
          <Route 
            path='/dashboard/ai-analysis' 
            element={
              <PrivateRoute>
                <AIAnalysis />
              </PrivateRoute>
            } 
          />
          <Route 
            path='/dashboard/settings' 
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
