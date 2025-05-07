import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon, 
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  PresentationChartLineIcon as ChartIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from './layout/DashboardLayout';

// Sample visualization component for the dashboard
const VisualizationPreview = () => {
  return (
    <div className="h-64 bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium text-gray-900">Recent Visualization</h3>
        <Link to="/dashboard/visualizations" className="text-sm text-indigo-600 hover:text-indigo-800">
          View All
        </Link>
      </div>
      <div className="h-40 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-md flex items-center justify-center">
        <div className="text-center">
          <ChartIcon className="h-10 w-10 text-indigo-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Create your first visualization or view recent charts
          </p>
          <Link to="/dashboard/visualizations" className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sample summary stats
  const summaryStats = [
    { id: 1, title: 'Files Processed', value: '42', change: '+8%', icon: DocumentTextIcon },
    { id: 2, title: 'Analyses Completed', value: '16', change: '+12%', icon: ChartBarIcon },
    { id: 3, title: 'Accuracy Rate', value: '94%', change: '+2.5%', icon: ArrowTrendingUpIcon },
    { id: 4, title: 'Storage Used', value: '1.2 GB', change: '+0.3 GB', icon: PresentationChartLineIcon }
  ];

  // Recent activity
  const recentActivity = [
    { id: 1, action: 'File Upload', item: 'quarterly_data.csv', time: '10 minutes ago' },
    { id: 2, action: 'Analysis Complete', item: 'Market Trends Report', time: '1 hour ago' },
    { id: 3, action: 'Visualization Generated', item: 'Revenue Forecast', time: '3 hours ago' },
    { id: 4, action: 'AI Analysis', item: 'Customer Behavior Patterns', time: 'Yesterday' }
  ];

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Simulate fetching recent files
    const fetchRecentFiles = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // For now, we'll just use a timeout to simulate network request
        setTimeout(() => {
          setRecentFiles([
            { id: 1, name: 'quarterly_data.csv', size: '2.4 MB', date: '10 minutes ago' },
            { id: 2, name: 'sales_report_2023.xlsx', size: '4.8 MB', date: '2 hours ago' },
            { id: 3, name: 'customer_data.xlsx', size: '1.2 MB', date: 'Yesterday' }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching files:', error);
        setLoading(false);
      }
    };
    
    fetchRecentFiles();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-gray-600">Here's what's happening with your data today.</p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryStats.map(stat => (
          <div key={stat.id} className="dashboard-card interactive-card">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                  <dd>
                    <div className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 dashboard-card">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentActivity.map(activity => (
              <li key={activity.id} className="px-6 py-4 flex items-center hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-indigo-600 truncate">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.item}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-6 py-4 border-t border-gray-200">
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all activity
            </button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <Link to="/dashboard/files" className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Upload New Data
            </Link>
            <Link to="/dashboard/visualizations" className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Create Visualization
            </Link>
            <Link to="/dashboard/ai-analysis" className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
              <PresentationChartLineIcon className="h-5 w-5 mr-2" />
              Run AI Analysis
            </Link>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
              Export Reports
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Files */}
        <div className="dashboard-card">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Files</h3>
              <Link to="/dashboard/files" className="text-sm text-indigo-600 hover:text-indigo-500">
                View all files
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="p-6 flex justify-center">
              <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : recentFiles.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentFiles.map(file => (
                <li key={file.id} className="px-6 py-4 flex items-center hover:bg-gray-50">
                  <DocumentChartBarIcon className="h-5 w-5 text-indigo-500 mr-3" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500">{file.size}</span>
                      <span className="mx-1 text-gray-300">•</span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {file.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/dashboard/visualizations?file=${file.id}`}
                      className="text-indigo-600 hover:text-indigo-900 p-2"
                      title="Visualize"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                    </Link>
                    <Link 
                      to={`/dashboard/ai-analysis?file=${file.id}`}
                      className="text-indigo-600 hover:text-indigo-900 p-2"
                      title="Analyze"
                    >
                      <PresentationChartLineIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">No files uploaded yet</p>
              <Link 
                to="/dashboard/files"
                className="btn-primary"
              >
                Upload your first file
              </Link>
            </div>
          )}
        </div>
        
        {/* Visualization Preview */}
        <VisualizationPreview />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard; 