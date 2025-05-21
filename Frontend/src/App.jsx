import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import ToastProvider from './components/ToastProvider';
import store from './redux/store';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// Protected route for admin users only
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  
  // Check if user is logged in and has admin role
  if (!user || !user.user || user.user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-app">
      <Header />
      <main className="flex-grow w-full relative">
        {isAuthPage && (
          <div className="absolute inset-0 bg-blue-800 opacity-90 z-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxYjRiNzgiIGZpbGwtb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjxwYXRoIGQ9Ik0xNiAxNmMwLTIuMiAxLjgtNCA0LTRzNCAxLjggNCA0LTEuOCA0LTQgNC00LTEuOC00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/admin/*" element={
                <ProtectedAdminRoute>
                  <AdminPanel />
                </ProtectedAdminRoute>
              } />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAuthPage && (
        <footer className="bg-white py-6 border-t border-gray-100 text-center text-gray-500 text-sm">
          <div className="container mx-auto px-4">
            &copy; {new Date().getFullYear()} Excel Analytics Platform. All rights reserved.
          </div>
        </footer>
      )}
      <ToastProvider />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
