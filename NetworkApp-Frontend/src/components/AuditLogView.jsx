// src/components/AuditLogView.jsx
import React, { useState, useEffect } from 'react';
import {
  Download,
  Search,
  BookOpenIcon,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRightIcon,
  EditIcon,
  PlusCircleIcon,
  Trash2Icon,
  Users, Package,ListTodo
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';

const auditLogs = [
  { id: 1, user: "Rajesh Kumar", action: "Assigned Router R1-WN1200", asset: "R1-WN1200", timestamp: "2025-10-24 14:32:18", role: "Technician" },
  { id: 2, user: "Priya Singh", action: "Customer A1.2 Activated", asset: "Customer A1.2", timestamp: "2025-10-24 13:15:42", role: "Planner" },
  { id: 3, user: "Admin User", action: "Created New User Account", asset: "User: Vikram Reddy", timestamp: "2025-10-24 11:20:05", role: "Admin" },
];

// const activityData = [
//   { type: "Asset Assignment", count: 45, color: 'bg-blue-500' },
//   { type: "Customer Creations", count: 32, color: 'bg-purple-500' },
//   { type: "Task Completed", count: 28, color: 'bg-green-500' },
//   { type: "Task pending", count: 12, color: 'bg-yellow-500' },
//   // { type: "User Management", count: 8, color: 'bg-red-500' },
// ];

// Helper function for role badge
const getRoleBadge = (role) => {
  if (!role) return null;
  let className = "bg-gray-100 text-gray-800 border border-gray-200";
  switch (role.toUpperCase()) {
    case "ADMIN": className = "bg-purple-100 text-purple-800 border border-purple-200"; break;
    case "PLANNER": className = "bg-teal-100 text-teal-800 border border-teal-200"; break;
    case "TECHNICIAN": className = "bg-orange-100 text-orange-800 border border-orange-200"; break;
    case "SUPPORTAGENT": className = "bg-blue-100 text-blue-800 border border-blue-200"; break;
    case "SALES_AGENT": className = "bg-indigo-100 text-indigo-700 border border-indigo-200"; break;
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}
    </span>
  );
};

// Action icon selector
const getActionIcon = (actionType = '') => {
  const upperAction = actionType.toUpperCase();
  if (upperAction.includes('CREATE') || upperAction.includes('ADD'))
    return <PlusCircleIcon className="w-4 h-4 text-green-500 mr-1" />;
  if (upperAction.includes('UPDATE') || upperAction.includes('ASSIGN'))
    return <EditIcon className="w-4 h-4 text-blue-500 mr-1" />;
  if (upperAction.includes('DELETE'))
    return <Trash2Icon className="w-4 h-4 text-red-500 mr-1" />;
  if (upperAction.includes('COMPLETE') || upperAction.includes('SUCCESS'))
    return <CheckCircle className="w-4 h-4 text-green-500 mr-1" />;
  if (upperAction.includes('START') || upperAction.includes('PROGRESS'))
    return <ArrowRightIcon className="w-4 h-4 text-yellow-500 mr-1" />;
  return <Activity className="w-4 h-4 text-gray-400 mr-1" />;
};

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activityStats, setActivityStats] = useState([
      // Set up placeholder structure
      { type: "Asset Assignment", count: 0, color: 'bg-blue-500', icon: Package },
      { type: "Customer Creations", count: 0, color: 'bg-purple-500', icon: Users },
      { type: "Task Completed", count: 0, color: 'bg-green-500', icon: CheckCircle },
      { type: "Task Pending", count: 0, color: 'bg-yellow-500', icon: ListTodo }
  ]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (filterUser) params.user = filterUser;
        if (filterAction !== 'all') params.actionType = filterAction;
        if (searchTerm) params.search = searchTerm;

        const response = await apiClient.get('/auditlogs', { params });
        setLogs(response.data);
      } catch (error) {
        toast.error("Failed to fetch audit logs.");
        console.error("Fetch audit logs error:", error);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [filterUser, filterAction, searchTerm]);

  const displayLogs = logs;

  // --- ADD useEffect to fetch stats ---
  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      try {
        const response = await apiClient.get('/dashboard/metrics');
        const data = response.data; // This is your DashboardMetricsDTO

        // Map DTO data to the frontend state structure
        setActivityStats([
          { type: "Asset Assignment", count: data.totalAssetAssignments, color: 'bg-blue-500', icon: Package },
          { type: "Customer Creations", count: data.totalCustomers, color: 'bg-purple-500', icon: Users },
          { type: "Task Completed", count: data.activeDeployments, color: 'bg-green-500', icon: CheckCircle },
          { type: "Task Pending", count: data.pendingTasks, color: 'bg-yellow-500', icon: ListTodo }
        ]);

      } catch (error) {
        toast.error("Failed to load activity stats.");
        console.error("Fetch stats error:", error);
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchStats();
  }, []); // Run once on mount

  return (
    <div className="space-y-5 p-3 md:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className='flex items-center gap-3'>
          <div className="p-2 bg-gray-100 rounded-lg border border-gray-200 hidden md:block">
            <BookOpenIcon className="h-6 w-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-0.5">Audit Logs</h2>
            <p className="text-sm text-gray-600">Track all system activities and changes</p>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

    {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"> {/* Changed to 4 cols */}
        {activityStats.map((stat) => {
          const Icon = stat.icon; // Get icon component
          return (
            <div key={stat.type} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {/* <div className={`w-1.5 h-10 ${stat.color} rounded`}></div> */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{stat.type}</p>
                    <p className={`text-xl font-bold ${isStatsLoading ? 'text-gray-400' : 'text-gray-900'}`}>
                      {isStatsLoading ? '...' : stat.count}
                    </p>
                  </div>
                   {/* Optional: Add icon to the right */}
                   <div className="ml-auto">
                       <Icon className={`w-5 h-5 ${stat.color.replace('bg', 'text')}`} />
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input
              type="text"
              placeholder="Filter by username..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Action Types</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-6 text-gray-500 text-sm">Loading logs...</td></tr>
              ) : displayLogs.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-6 text-gray-500 text-sm">No audit logs found.</td></tr>
              ) : (
                displayLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-sm text-gray-800 align-middle">{log.username}</td>
                    <td className="pr-1 py-3 text-sm text-gray-700 align-middle">
                      <div className="flex items-center">
                        {getActionIcon(log.actionType)}
                        <span className="truncate">{log.actionType}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-700 align-middle">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className=" py-3 text-sm text-gray-700 align-middle">
                      {getRoleBadge(log.userRole)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {logs.length} results</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-md hover:bg-gray-50" disabled>Previous</button>
            <button className="px-3 py-1 border rounded-md hover:bg-gray-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
