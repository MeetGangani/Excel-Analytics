import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');
  
  // Track the tab for visual indication in header, but we always show the dashboard
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'dashboard');
  
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalStorage: 0,
    activeUsers: 0,
  });
  const [analytics, setAnalytics] = useState({
    userGrowth: { labels: [], data: [] },
    fileUploads: { labels: [], data: [] },
    storageUsage: { labels: [], data: [] },
    fileTypes: { labels: [], sizes: [], counts: [] }
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Handle URL query parameter changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('dashboard');
    }
  }, [tabFromUrl]);
  
  useEffect(() => {
    // Fetch data once component mounts
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = user.token;
      
      // Fetch users
      const usersData = await adminService.getUsers(token);
      setUsers(usersData);
      
      // Fetch files
      const filesData = await adminService.getFiles(token);
      setFiles(filesData);
      
      // Fetch stats
      const statsData = await adminService.getStats(token);
      setStats(statsData);
      
      // Fetch analytics
      const analyticsData = await adminService.getAnalytics(token);
      setAnalytics(analyticsData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    try {
      const token = user.token;
      await adminService.deleteUser(userId, token);
      
      // Update users list
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };
  
  const handleDeleteFile = async (fileId) => {
    try {
      const token = user.token;
      await adminService.deleteFile(fileId, token);
      
      // Update files list
      setFiles(files.filter(f => f._id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatStorage = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your Excel Analytics platform</p>
            </div>
            <button 
              onClick={fetchDashboardData}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          {/* Content based on active tab */}
          <div className="mb-10">
            {!activeTab || activeTab === 'dashboard' ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Admin Dashboard</h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm">Total Users</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm">Total Files</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalFiles}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm">Total Storage</p>
                            <p className="text-2xl font-bold text-gray-800">{formatStorage(stats.totalStorage)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        <div className="flex items-center">
                          <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm">Active Users</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.activeUsers}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {users.slice(0, 5).map((user) => (
                                <tr key={user._id}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{user.name}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Files</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {files.slice(0, 5).map((file) => (
                                <tr key={file._id}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{file.filename}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatStorage(file.size)}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDate(file.uploadedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : activeTab === 'users' ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Manage Users</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Add New User
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button className="text-indigo-600 hover:text-indigo-900">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button 
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => handleDeleteUser(user._id)}
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'files' ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Manage Files</h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {files.map((file) => (
                            <tr key={file._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <svg className="w-5 h-5 text-emerald-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{file.owner?.name || 'Unknown'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{formatStorage(file.size)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(file.uploadedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button className="text-indigo-600 hover:text-indigo-900">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </button>
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button 
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => handleDeleteFile(file._id)}
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">System Analytics</h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
                      <div className="h-64">
                        <Bar 
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: 'Monthly Growth',
                              },
                            },
                          }} 
                          data={{
                            labels: analytics.userGrowth.labels,
                            datasets: [
                              {
                                label: 'New Users',
                                data: analytics.userGrowth.data,
                                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                                borderColor: 'rgb(53, 162, 235)',
                                borderWidth: 1,
                              }
                            ],
                          }} 
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">File Uploads</h3>
                      <div className="h-64">
                        <Bar 
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: 'Monthly Growth',
                              },
                            },
                          }}
                          data={{
                            labels: analytics.fileUploads.labels,
                            datasets: [
                              {
                                label: 'File Uploads',
                                data: analytics.fileUploads.data,
                                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                borderColor: 'rgb(75, 192, 192)',
                                borderWidth: 1,
                              }
                            ],
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Storage Usage</h3>
                      <div className="h-64">
                        <Line 
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: 'Monthly Growth',
                              },
                            },
                          }}
                          data={{
                            labels: analytics.storageUsage.labels,
                            datasets: [
                              {
                                label: 'Storage Used (MB)',
                                data: analytics.storageUsage.data,
                                fill: true,
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1,
                              }
                            ],
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">File Types</h3>
                      <div className="h-64">
                        <Doughnut 
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              title: {
                                display: true,
                                text: 'File Type Distribution',
                              },
                            },
                          }}
                          data={{
                            labels: analytics.fileTypes.labels,
                            datasets: [
                              {
                                label: 'Storage by File Type (MB)',
                                data: analytics.fileTypes.sizes,
                                backgroundColor: [
                                  'rgba(255, 99, 132, 0.5)',
                                  'rgba(54, 162, 235, 0.5)',
                                  'rgba(255, 206, 86, 0.5)',
                                  'rgba(75, 192, 192, 0.5)',
                                  'rgba(153, 102, 255, 0.5)',
                                  'rgba(255, 159, 64, 0.5)',
                                ],
                                borderWidth: 1,
                              }
                            ],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel;
