import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Header = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const { token } = JSON.parse(userData);
                
                // Call logout endpoint
                await fetch('http://localhost:5000/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            // Use the logout function from context
            logout();
            
            // Redirect to login page
            navigate('/');
        }
    };

    return(
        <>
        <header className="bg-white shadow-sm">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
                <div className="flex items-center space-x-3">
                    <img
                        alt="Company Logo"
                        src="https://images.unsplash.com/vector-1739889219750-1aedc85afd61?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        className="h-10 w-auto"
                    />
                    <Link to={isAuthenticated ? '/dashboard' : '/'} className="text-xl font-bold text-gray-900">
                        Excel Analyzer Platform
                    </Link>
                </div>
                
                {isAuthenticated ? (
                    <div className="flex items-center space-x-4">
                        <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                            Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                            Login
                        </Link>
                        <Link to="/register" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded">
                            Register
                        </Link>
                    </div>
                )}
            </nav>
        </header>
        </>
    )
};

export default Header;