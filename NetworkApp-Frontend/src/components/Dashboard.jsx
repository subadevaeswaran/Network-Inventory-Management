// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react'; // Add hooks if fetching data
import { Users, Truck, Package, AlertTriangle, ListTodo, Activity, CheckCircle, XCircle, Network } from 'lucide-react';
 import apiClient from '../api/apiClient'; 
 import { toast } from 'react-toastify'; 



const mockRecentActivity = [
  { id: 1, action: 'Customer A1.2 Activated', user: 'Rajesh Kumar', time: '5 mins ago', type: 'success' },
  { id: 2, action: 'ONT SN1234 Assigned to House B1.2', user: 'Priya Singh', time: '12 mins ago', type: 'info' },
  { id: 3, action: 'Deployment Task Created for C3.4', user: 'Amit Patel', time: '23 mins ago', type: 'info' },
  { id: 4, action: 'Router R1-WN1200 Marked as Faulty', user: 'System', time: '1 hour ago', type: 'warning' },
  { id: 5, action: 'FDH-B1 Installation Completed', user: 'Suresh Reddy', time: '2 hours ago', type: 'success' },
];
// End Placeholder Data


// Main Dashboard Component
export default function Dashboard({ currentUserRole , setActiveView  }) { // Receive role if needed for customization

const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeDeployments: 0,
    availableDevices: 0,
    pendingTasks: 0,
    // Add faultyDevices later if needed
  });

  const [topologySummary, setTopologySummary] = useState({
      headendName: 'Loading...',
      fdhCount: 0,
      splitterCount: 0,
      houseCount: 0 // Count connected houses/customers
  });

  const [isLoadingTopology, setIsLoadingTopology] = useState(true);

  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);
      try {
        const response = await apiClient.get('/dashboard/metrics'); // Call backend
        setMetrics(response.data); // Update state with fetched data
      } catch (error) {
        toast.error("Failed to load dashboard metrics.");
        console.error("Dashboard metrics fetch error:", error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, []); // Run once on mount

  // --- **NEW**: Fetch Topology Summary for Chennai on Mount ---
  useEffect(() => {
    const fetchTopologySummary = async () => {
        setIsLoadingTopology(true);
        try {
            // Fetch topology specifically for Chennai
            const response = await apiClient.get('/topology?city=Chennai');
            const nodes = response.data; // Assuming this is the List<TopologyNodeDTO>

            // Calculate counts
            let headendName = 'N/A';
            let fdhCount = 0;
            let splitterCount = 0;
            let houseCount = 0;

            if (Array.isArray(nodes) && nodes.length > 0) {
                const headendNode = nodes.find(n => n.type === 'Headend');
                headendName = headendNode ? headendNode.name : 'Unknown Headend';
                fdhCount = nodes.filter(n => n.type === 'FDH').length;
                splitterCount = nodes.filter(n => n.type === 'Splitter').length;
                houseCount = nodes.filter(n => n.type === 'House').length;
            }

            setTopologySummary({ headendName, fdhCount, splitterCount, houseCount });

        } catch (error) {
            toast.error("Failed to load topology summary.");
            console.error("Topology summary fetch error:", error);
             setTopologySummary({ headendName: 'Error', fdhCount: 0, splitterCount: 0, houseCount: 0 });
        } finally {
            setIsLoadingTopology(false);
        }
    };
    fetchTopologySummary();
  }, []); // Run once on mount

  const metricDisplayConfig = [
    { key: 'totalCustomers', title: 'Total Customers', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'activeDeployments', title: 'Completed Deployments', icon: Truck, color: 'text-green-600', bg: 'bg-green-50' },
    { key: 'availableDevices', title: 'Available Devices', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { key: 'pendingTasks', title: 'Pending Tasks', icon: ListTodo, color: 'text-orange-600', bg: 'bg-orange-50' },
    // Add Faulty Devices here when ready
    // { key: 'faultyDevices', title: 'Faulty Devices', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];


  // Use mock data directly for this example
 
  const recentActivity = mockRecentActivity;
  


  // Helper to get icon for recent activity
  const getActivityIcon = (type) => {
    switch (type) {
        case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        case 'error': return <XCircle className="w-5 h-5 text-red-500" />; // Example for error
        case 'info':
        default: return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-2"> {/* Added padding */}
     
{/* 
     Header
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-600">
          Network inventory and activity overview.
        </p>
      </div> */}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 cu">
        {metricDisplayConfig.map((config) => {
          const Icon = config.icon;
          // Get value from state, show '...' if loading
          const value = isLoadingMetrics ? '...' : (metrics[config.key] ?? 0);
          return (
            <div key={config.key} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden cursor-pointer">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{config.title}</p>
                    {/* Display fetched value */}
                    <p className={`text-2xl font-bold ${isLoadingMetrics ? 'text-gray-400' : 'text-gray-900'}`}>{value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {/* Placeholder for Faulty Devices if needed */}
         <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden cursor-pointer">
             <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Faulty Devices</p>
                    <p className={`text-2xl font-bold ${isLoadingMetrics ? 'text-gray-400' : 'text-gray-900'}`}>{'...'}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-red-50 text-red-600`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
             </div>
         </div>

      </div>

      {/* Grid for Topology Summary and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* --- Network Topology Summary Card (Updated) --- */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Network className="w-5 h-5 text-blue-600" />
                Topology Summary (Chennai) {/* Specify City */}
            </h3>
          </div>
          {/* Content */}
          <div className="p-4 space-y-5">
            {isLoadingTopology ? (
                <div className="text-center text-gray-500 py-8">Loading summary...</div>
            ) : (
                <>
                    {/* Simplified Visual Representation */}
                    <div className="bg-gray-50 p-10 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-center">
                        <div className="text-center space-y-3">
                          {/* Headend */}
                          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium border border-blue-200 truncate max-w-[150px]" title={topologySummary.headendName}>
                            {topologySummary.headendName}
                          </div>
                          {/* Connecting Line */}
                          <div className="w-px h-6 bg-gray-300 mx-auto"></div>
                          {/* FDHs Row (Simplified) */}
                          <div className="flex gap-4 justify-center items-center">
                              <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium border border-green-200">
                                FDHs ({topologySummary.fdhCount})
                              </div>
                              <div className="w-4 h-px bg-gray-300 "></div> {/* Simple connector */}
                              <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[11px] font-medium border border-purple-200">
                                Splitters ({topologySummary.splitterCount})
                              </div>
                               <div className="w-4 h-px bg-gray-300 "></div> {/* Simple connector */}
                                <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[11px] font-medium border border-gray-200">
                                Houses ({topologySummary.houseCount})
                              </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Counts */}
                    <div className="grid grid-cols-3 gap-4 text-center pt-2">
                      <div>
                        <p className="text-xl font-bold text-gray-900">{topologySummary.fdhCount}</p>
                        <p className="text-xs text-gray-500 uppercase">FDH Units</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">{topologySummary.splitterCount}</p>
                        <p className="text-xs text-gray-500 uppercase">Splitters</p>
                      </div>
                      <div>
                         <p className="text-xl font-bold text-gray-900">{topologySummary.houseCount}</p>
                         <p className="text-xs text-gray-500 uppercase">Connected Houses</p>
                       </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => {
                // Determine the correct state value based on role
                const topologyViewState = currentUserRole === 'ADMIN' ? 'ADMIN_TOPOLOGY' : 'PLANNER_TOPOLOGY'; // Example
                setActiveView(topologyViewState); // Call the function passed via props
               }}
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Full Topology
                    </button>
                </>
            )}
          </div>
        </div>
        {/* --- End Topology Summary --- */}

        {/* Recent Activity Feed Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
               <Activity className="w-5 h-5 text-gray-500" /> {/* Icon */}
               Recent Activity
               <span className="relative flex h-2 w-2 mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </h3>
            
          </div>
          {/* Content */}
          <div className="p-4 space-y-0"> {/* Remove vertical space between items */}
             <div className="max-h-96 overflow-y-auto pr-2"> {/* Scrollable area */}
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className={`flex items-start gap-3 py-3 ${index < recentActivity.length - 1 ? 'border-b border-gray-100' : ''}`}> {/* Add border between items */}
                    <div className="mt-1 flex-shrink-0"> {/* Align icon */}
                       {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium break-words">{activity.action}</p> {/* Allow wrap */}
                      <p className="text-xs text-gray-500 mt-0.5">
                        by {activity.user} &bull; {activity.time} {/* Use bullet */}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            {/* Button */}
            <button
              onClick={() => { /* Navigate to logs page */ }}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              View Full Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}