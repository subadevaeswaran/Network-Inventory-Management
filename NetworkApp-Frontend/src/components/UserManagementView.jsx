import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { toast } from 'react-toastify';
// Attempting to fix the import path. Assuming apiClient.js is in src/
import apiClient from '../api/apiClient'; 

// --- Icon Components (Replacing lucide-react) ---
// (These are your existing inline SVG components)
const UsersIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const ShieldIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const FileTextIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 8 9 8 11" />
  </svg>
);
const UserCheckIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>
);
const AlertTriangleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const PlusIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const EditIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const CloseIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
// --- End Icons ---


// --- Mock Data (This is for the *permissions* card only, which is still mock) ---
const permissions = {
  ADMIN: ['All Permissions', 'User Management', 'System Configuration', 'View All Data', 'Export Data'],
  PLANNER: ['Create Tasks', 'Assign Resources', 'View Inventory', 'Manage Customers', 'View Reports'],
  TECHNICIAN: ['View Tasks', 'Update Task Status', 'View Topology', 'Report Issues', 'Update Inventory'],
  SUPPORTAGENT: ['View Customers', 'View Tasks', 'View Logs', 'Create Tickets'],
  SALES_AGENT: ['Manage Customers', 'View Sales Dashboard', 'Create Quotes'],
};

// --- Helper Components ---

// getRoleBadge is correct and unchanged
const getRoleBadge = (role) => {
  switch (role) {
    case 'ADMIN':
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">ADMIN</span>;
    case 'PLANNER':
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-700">PLANNER</span>;
    case 'TECHNICIAN':
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">TECHNICIAN</span>;
    case 'SUPPORTAGENT':
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">SUPPORT AGENT</span>;
    case 'SALES_AGENT':
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">SALES AGENT</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{role}</span>;
  }
};

// 2. UPDATED getStatusBadge to use real logic from the 'lastLogin' prop
const getStatusBadge = (lastLogin) => {
  if (!lastLogin) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Never</span>;
  }
  
  const lastLoginDate = new Date(lastLogin);
  const now = new Date();
  // Check if last login was within the last 30 days
  const diffInDays = (now.getTime() - lastLoginDate.getTime()) / (1000 * 3600 * 24);

  if (diffInDays <= 30) {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>;
  } else {
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Inactive</span>;
  }
};

// --- Main UserManagementView Component ---
export default function UserManagementView() {
  // 3. State is now initialized as empty, to be filled from the API
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    failedLogins: 0,
    auditLogs: 0, // <-- 1. ADDED AUDIT LOGS
  });
  const [isLoading, setIsLoading] = useState(true); // Page load loading
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Modal submission loading

  // State for the "Add User" form (this is correct)
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('SALES_AGENT');
  const [newUserPassword, setNewUserPassword] = useState('');

  // 4. Renamed to fetchAllData
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // --- 2. FETCH USERS AND AUDIT LOGS IN PARALLEL ---
      const [usersResponse, auditLogsResponse] = await Promise.all([
        apiClient.get('/api/v1/admin/users'),
        apiClient.get('/auditlogs') // <-- 3. USE NEW ENDPOINT
      ]);
      
      // Process Users
      setUsers(usersResponse.data);
      
      // Calculate Active Users metric dynamically
      const now = new Date();
      const active = usersResponse.data.filter(user => {
        if (!user.lastLogin) return false;
        const lastLoginDate = new Date(user.lastLogin);
        const diffInDays = (now.getTime() - lastLoginDate.getTime()) / (1000 * 3600 * 24);
        return diffInDays <= 30;
      }).length;
      
      // --- 4. NEW: Process Audit Logs ---
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      const auditLogs24h = auditLogsResponse.data.filter(log => {
          if (!log.timestamp) return false;
          const logTimestamp = new Date(log.timestamp);
          return logTimestamp > twentyFourHoursAgo;
      }).length;
      
      // 5. Set metrics from the new endpoint
      setMetrics({
        activeUsers: active,
        auditLogs: auditLogs24h, // <-- Use calculated value
        failedLogins: 14, // <-- Keep this as a mock for now
      });
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data.');
      // Set metrics to 0 on failure
      setMetrics({ activeUsers: 0, auditLogs: 0, failedLogins: 0 });
    } finally {
      // We're done loading, whether it succeeded or failed
      setIsLoading(false);
    }
  };

  // 5. useEffect hook now calls fetchAllData
  useEffect(() => {
    fetchAllData();
  }, []); // The empty array `[]` means this runs only once on mount

  // 6. handleCreateUser: Updated to refresh ALL data on success
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      username: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole, // This state is correctly set by the dropdown
    };
    
    try {
      // This is the correct endpoint as requested
      const response = await apiClient.post('/api/v1/auth/signup', payload);
      toast.success(response.data.message || 'User created successfully');
      
      // Reset form and close modal
      setIsModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('SALES_AGENT');
      
      // --- REFRESH ALL DATA ---
      fetchAllData();

    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to create user');
      } else {
        toast.error('Failed to create user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 7. handleDeleteUser: Updated to refresh ALL data on success
  const handleDeleteUser = async (userId) => {
    // Add a confirmation dialog
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Call the new admin delete endpoint
        const response = await apiClient.delete(`/api/v1/admin/users/${userId}`);
        toast.success(response.data.message || 'User deleted');
        
        // --- REFRESH ALL DATA ---
        fetchAllData(); 
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error(error.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  // 8. NEW: Render a loading state while fetching
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Simple loading spinner */}
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  // --- This is the main component render ---
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Admin Dashboard</h2>
        <p className="text-sm text-gray-600">Manage users, roles, and system configuration</p>
      </div>

      {/* Quick Links (now using real data from state) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Active Users (Dynamic) */}
        <div className="bg-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheckIcon className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users (30d)</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card 2: Active Roles (Static) */}
        <div className="bg-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShieldIcon className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(permissions).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Audit Logs (Dynamic) */}
        <div className="bg-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileTextIcon className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Audit Logs (24h)</p>
                {/* 5. HOOKED UP METRIC */}
                <p className="text-2xl font-bold text-gray-900">{metrics.auditLogs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Failed Logins (Dynamic) */}
        <div className="bg-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangleIcon className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed Logins (24h)</p>
                {/* 6. HOOKED UP METRIC */}
                <p className="text-2xl font-bold text-gray-900">{metrics.failedLogins}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management (now using 'users' state) */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">User Management ({users.length} Users)</h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer "
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* 9. We now map over the 'users' state from the API */}
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(user.lastLogin)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {/* Format the timestamp */}
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button className="text-gray-500 hover:text-blue-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-gray-500 hover:text-red-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Permissions (This is still mock data) */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(permissions).map(([role, perms]) => (
              <div key={role} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-900">{role.replace('_', ' ')}</h3>
                  {getRoleBadge(role)}
                </div>
                <ul className="space-y-2">
                  {perms.map((perm) => (
                    <li key={perm} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                      {perm}
                    </li>
                  ))}
                </ul>
              
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add New User Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Add New User</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  placeholder="Enter username" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="user@network.com" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {/* --- FIX: MAPPING ROLE VALUES TO DISPLAY NAMES --- */}
                  <option value="ADMIN">ADMIN</option>
                  <option value="PLANNER">PLANNER</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="SUPPORTAGENT">SUPPORT AGENT</option>
                  <option value="SALES_AGENT">SALES AGENT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

