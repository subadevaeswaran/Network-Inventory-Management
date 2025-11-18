import React, { useState, useEffect } from 'react';
import { Users, Truck, Package, AlertTriangle, ListTodo, Activity, CheckCircle, XCircle, Network } from 'lucide-react';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const mockRecentActivity = [
  { id: 1, action: 'Customer A1.2 Activated', user: 'Rajesh Kumar', time: '5 mins ago', type: 'success' },
  { id: 2, action: 'ONT SN1234 Assigned to House B1.2', user: 'Priya Singh', time: '12 mins ago', type: 'info' },
  { id: 3, action: 'Deployment Task Created for C3.4', user: 'Amit Patel', time: '23 mins ago', type: 'info' },
  { id: 4, action: 'Router R1-WN1200 Marked as Faulty', user: 'System', time: '1 hour ago', type: 'warning' },
  { id: 5, action: 'FDH-B1 Installation Completed', user: 'Suresh Reddy', time: '2 hours ago', type: 'success' },
];

const Dashboard = ({ currentUserRole, setActiveView }) => {
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeDeployments: 0,
    availableDevices: 0,
    pendingTasks: 0,
  });

  const [topologySummary, setTopologySummary] = useState({
    headendName: 'Loading...',
    fdhCount: 0,
    splitterCount: 0,
    houseCount: 0
  });

  const [isLoadingTopology, setIsLoadingTopology] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);
      try {
        const response = await apiClient.get('/dashboard/metrics');
        setMetrics(response.data);
      } catch (error) {
        toast.error("Failed to load dashboard metrics.");
        console.error("Dashboard metrics fetch error:", error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchTopologySummary = async () => {
      setIsLoadingTopology(true);
      try {
        const response = await apiClient.get('/topology?city=Chennai');
        const nodes = response.data;

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
  }, []);

  const metricDisplayConfig = [
    { key: 'totalCustomers', title: 'Total Customers', icon: Users },
    { key: 'activeDeployments', title: 'Completed Deployments', icon: Truck },
    { key: 'availableDevices', title: 'Available Devices', icon: Package },
    { key: 'pendingTasks', title: 'Pending Tasks', icon: ListTodo },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default: return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {metricDisplayConfig.map((config, index) => {
          const Icon = config.icon;
          const value = isLoadingMetrics ? '...' : (metrics[config.key] ?? 0);
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              key={config.key}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:border-[#2563eb]/20 hover:shadow-md transition-all"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-1">{config.title}</p>
                    <p className={`text-2xl font-bold ${isLoadingMetrics ? 'text-[#94a3b8]' : 'text-[#334155]'}`}>{value}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f8fafc] text-[#2563eb]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Faulty Devices Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:border-[#2563eb]/20 hover:shadow-md transition-all"
        >
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-1">Faulty Devices</p>
                <p className={`text-2xl font-bold ${isLoadingMetrics ? 'text-[#94a3b8]' : 'text-[#334155]'}`}>{'...'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-red-50/50 text-red-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Grid for Topology Summary and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Topology Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-[#334155] flex items-center gap-2">
              <Network className="w-5 h-5 text-[#2563eb]" />
              Topology Summary (Chennai)
            </h3>
          </div>
          <div className="p-4 space-y-5">
            {isLoadingTopology ? (
              <div className="text-center text-gray-500 py-8">Loading summary...</div>
            ) : (
              <>
                <div className="bg-[#f8fafc] p-10 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="inline-block px-3 py-1 bg-[#2563eb]/10 text-[#2563eb] rounded-lg text-xs font-medium border border-[#2563eb]/20 truncate max-w-[150px]"
                        title={topologySummary.headendName}
                      >
                        {topologySummary.headendName}
                      </motion.div>
                      <div className="w-px h-6 bg-[#94a3b8]/30 mx-auto" />
                      <div className="flex gap-4 justify-center items-center">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="px-2 py-1 bg-[#2563eb]/5 text-[#2563eb] rounded-lg text-xs font-medium border border-[#2563eb]/20"
                        >
                          FDHs ({topologySummary.fdhCount})
                        </motion.div>
                        <div className="w-4 h-px bg-[#94a3b8]/30" />
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="px-2 py-1 bg-[#2563eb]/5 text-[#2563eb] rounded-lg text-[11px] font-medium border border-[#2563eb]/20"
                        >
                          Splitters ({topologySummary.splitterCount})
                        </motion.div>
                        <div className="w-4 h-px bg-[#94a3b8]/30" />
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          className="px-2 py-1 bg-[#2563eb]/5 text-[#2563eb] rounded-lg text-[11px] font-medium border border-[#2563eb]/20"
                        >
                          Houses ({topologySummary.houseCount})
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center pt-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <p className="text-xl font-bold text-[#334155]">{topologySummary.fdhCount}</p>
                    <p className="text-xs text-[#64748b] uppercase tracking-wide">FDH Units</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <p className="text-xl font-bold text-[#334155]">{topologySummary.splitterCount}</p>
                    <p className="text-xs text-[#64748b] uppercase tracking-wide">Splitters</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <p className="text-xl font-bold text-[#334155]">{topologySummary.houseCount}</p>
                    <p className="text-xs text-[#64748b] uppercase tracking-wide">Connected Houses</p>
                  </motion.div>
                </div>

                <button
                  onClick={() => {
                    const topologyViewState = currentUserRole === 'ADMIN' ? 'ADMIN_TOPOLOGY' : 'PLANNER_TOPOLOGY';
                    setActiveView(topologyViewState);
                  }}
                  className="w-full mt-4 px-4 py-2 border border-[#2563eb]/20 rounded-xl text-sm font-medium text-[#2563eb] bg-[#2563eb]/5 hover:bg-[#2563eb]/10 transition-colors"
                >
                  View Full Topology
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Recent Activity Feed Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-[#334155] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#2563eb]" />
              Recent Activity
              <span className="relative flex h-2 w-2 mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            </h3>
          </div>
          <div className="p-4 space-y-0">
            <div className="max-h-96 overflow-y-auto pr-2">
              {mockRecentActivity.map((activity, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  key={activity.id}
                  className={`flex items-start gap-3 py-3 ${index < mockRecentActivity.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#334155] font-medium break-words">{activity.action}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      by {activity.user} &bull; {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => { /* Navigate to logs page */ }}
              className="w-full mt-4 px-4 py-2 border border-[#2563eb]/20 rounded-xl text-sm font-medium text-[#2563eb] bg-[#2563eb]/5 hover:bg-[#2563eb]/10 transition-colors"
            >
              View Full Logs
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;