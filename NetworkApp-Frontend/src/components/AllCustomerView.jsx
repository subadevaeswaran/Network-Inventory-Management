// src/components/AllCustomersView.jsx
import React, { useState, useEffect } from 'react';
import { Users, Truck, Package, AlertTriangle, ListTodo, Activity, CheckCircle2, Search, X, User, MapPin, Wifi, Network, Calendar, Phone, Mail, ArrowRight, Building2, Signal, Clock, DollarSign, Zap } from 'lucide-react';
import Modal from 'react-modal'; // Use react-modal for the popups
import { toast } from 'sonner';
    import apiClient from '../api/apiClient'; 

// Set modal app element
Modal.setAppElement('#root');

// // Dummy customer data (as provided in your code)
// const dummyCustomers = [
//   { id: 'C001', name: 'House A2.1', address: '123 Main Street, Building A2, Unit 1, Zone A', phone: '+1 555-0123', email: 'contact@housea21.com', plan: 'Ultra 500 Mbps', connectionType: 'FTTH', status: 'active', fdh: 'FDH-A1', splitter: 'SPL-1-8', port: 'Port 3', ont: 'ONT-SN1234', router: 'R1-WN1200', installDate: '2024-01-15', lastActive: '2024-10-30', monthlyFee: '$89.99', uptime: '99.8%', bandwidth: '500 Mbps' },
//   { id: 'C002', name: 'Maple Corporation HQ', address: '456 Business Ave, Floor 8, Zone B', phone: '+1 555-0456', email: 'it@maplecorp.com', plan: 'Premium 200 Mbps', connectionType: 'FTTB', status: 'active', fdh: 'FDH-B1', splitter: 'SPL-1-16', port: 'Port 7', ont: 'ONT-SN1235', router: 'R1-WN1201', installDate: '2024-02-20', lastActive: '2024-10-30', monthlyFee: '$69.99', uptime: '99.9%', bandwidth: '200 Mbps' },
//   { id: 'C003', name: 'Green Valley Apartments 12B', address: '789 Park Lane, Building 12, Unit B, Zone A', phone: '+1 555-0789', email: 'resident12b@greenvalley.com', plan: 'Standard 100 Mbps', connectionType: 'FTTH', status: 'active', fdh: 'FDH-A1', splitter: 'SPL-1-8', port: 'Port 5', ont: 'ONT-SN1236', router: 'R1-WN1202', installDate: '2024-03-10', lastActive: '2024-10-29', monthlyFee: '$49.99', uptime: '99.5%', bandwidth: '100 Mbps' },
//   { id: 'C004', name: 'Tech Startup Office', address: '321 Innovation Drive, Suite 200, Zone C', phone: '+1 555-0321', email: 'admin@techstartup.io', plan: 'Ultra 500 Mbps', connectionType: 'GPON', status: 'pending', fdh: 'FDH-C1', splitter: 'SPL-1-16', port: 'Port 2', ont: 'ONT-SN1237', router: 'R1-WN1203', installDate: '2024-10-25', lastActive: 'N/A', monthlyFee: '$89.99', uptime: 'N/A', bandwidth: '500 Mbps' },
//   { id: 'C005', name: 'Riverside Cafe', address: '654 River Road, Corner Unit, Zone B', phone: '+1 555-0654', email: 'owner@riversidecafe.com', plan: 'Basic 50 Mbps', connectionType: 'FTTH', status: 'active', fdh: 'FDH-B1', splitter: 'SPL-1-8', port: 'Port 1', ont: 'ONT-SN1238', router: 'R1-WN1204', installDate: '2024-01-05', lastActive: '2024-10-30', monthlyFee: '$29.99', uptime: '99.2%', bandwidth: '50 Mbps' },
//   { id: 'C006', name: 'Downtown Medical Center', address: '987 Health Street, Medical Plaza, Zone C', phone: '+1 555-0987', email: 'it@medicalcenter.org', plan: 'Premium 200 Mbps', connectionType: 'FTTB', status: 'inactive', fdh: 'FDH-C1', splitter: 'SPL-1-32', port: 'Port 15', ont: 'ONT-SN1239', router: 'R1-WN1205', installDate: '2024-06-12', lastActive: '2024-09-15', monthlyFee: '$69.99', uptime: '98.8%', bandwidth: '200 Mbps' }
// ];

// Replicated helper functions (styles matching the sample)
const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'SCHEDULED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'inactive':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getStatusDot = (status) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-500';
    case 'pending':
      return 'bg-amber-500';
    case 'inactive':
      return 'bg-slate-400';
    default:
      return 'bg-slate-400';
  }
};


const customerStatuses = ['ALL', 'ACTIVE', 'SCHEDULED', 'INACTIVE'];

export default function AllCustomersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false); // For details panel
  // Add state for customers list if fetching from API
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, pending: 0, inactive: 0 });
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const [cities, setCities] = useState([]); // For city dropdown
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [cityFilter, setCityFilter] = useState('ALL'); // Default to 'ALL'
  const [statusFilter, setStatusFilter] = useState('ALL'); // Default to 'ALL'

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        // Use the endpoint that returns unique city names
        const response = await apiClient.get('/headends/cities'); 
        setCities(response.data);
      } catch (error) {
        toast.error("Could not load city list.");
        console.error("Fetch cities error:", error);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, []); // Run once on mount

// --- **UPDATE**: useEffect to fetch customers based on filters ---
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        // Build params object
        const params = {};
        if (cityFilter !== 'ALL') params.city = cityFilter;
        if (statusFilter !== 'ALL') params.status = statusFilter;
        // You can add search query here later if backend supports it
        // if (searchQuery) params.search = searchQuery; 

        // Call API with filters
        const response = await apiClient.get('/customer/cs', { params });
        const customerData = response.data;
        setCustomers(customerData);

        // Re-calculate stats based on *fetched* data
        const active = customerData.filter(c => c.status === 'ACTIVE').length;
        const pending = customerData.filter(c => c.status === 'PENDING' || c.status === 'SCHEDULED').length;
        const inactive = customerData.filter(c => c.status === 'INACTIVE').length;
        setStats({ active, pending, inactive });

      } catch (error) {
          toast.error("Failed to load customers.");
          console.error("Fetch customers error:", error);
          setCustomers([]); // Clear on error
      } finally {
          setIsLoading(false);
      }
    };
    
    // Run fetchCustomers when filters change
    fetchCustomers(); 
  }, [cityFilter, statusFilter]); // <-- Depend on filters


  // --- ADD useEffect to fetch asset details when modal opens ---
  useEffect(() => {
    // Only run if the modal is open and a customer is selected
    if (sheetOpen && selectedCustomer) {
      // Clear previous asset details
      setAssignedAssets([]);

      // Only fetch assets if the customer is SCHEDULED or ACTIVE
      if (selectedCustomer.status === 'ACTIVE' || selectedCustomer.status === 'SCHEDULED') {
        const fetchAssignedAssets = async () => {
          setIsFetchingDetails(true);
          try {
            // Call the endpoint you built for the technician's report view
            const response = await apiClient.get(`/assigned-assets/by-customer/${selectedCustomer.id}`);
            setAssignedAssets(response.data);
          } catch (error) {
            toast.error("Failed to load customer's assigned assets.");
            console.error("Fetch assigned assets error:", error);
          } finally {
            setIsFetchingDetails(false);
          }
        };

        // If status is ACTIVE, fetch assets.
        // If SCHEDULED, the fdhName/splitterModel will come from the CustomerDTO.
        if (selectedCustomer.status === 'ACTIVE') {
             fetchAssignedAssets();
        } else {
            // If just scheduled, no assets are assigned yet
             setIsFetchingDetails(false);
        }
      }
    }
  }, [selectedCustomer, sheetOpen]);


  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    (customer.name && customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (customer.id && String(customer.id).toLowerCase().includes(searchQuery.toLowerCase())) || // Ensure ID is string
    (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setSheetOpen(true);
  };

  // --- Replicated Stat Card Component ---
  const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, borderColor }) => (
     <div className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${borderColor}`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          </div>
        </div>
     </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Customers</h2>
          <p className="text-sm text-gray-500">Manage customer accounts and network assignments</p>
        </div>
        {/* Add Customer Button Removed as requested */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Manually create stat cards based on dummy data */}
      <StatCard
          title="Active Customers"
          value={isLoading ? '...' : stats.active}
          icon={Activity}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          borderColor="border-l-emerald-500"
        />
         <StatCard
          title="Pending"
          value={isLoading ? '...' : stats.pending}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          borderColor="border-l-amber-500"
        />
         <StatCard
          title="Inactive"
          value={isLoading ? '...' : stats.inactive}
          icon={User} // Using User as placeholder
          iconBg="bg-slate-50"
          iconColor="text-slate-600"
          borderColor="border-l-slate-500"
        />
         {/* Total Revenue Card Removed */}
      </div>

    {/* --- Search and Filter Bar --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="md:col-span-1"> {/* Adjust span as needed */}
             <label htmlFor="customerSearch" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input
                 type="text" id="customerSearch"
                 placeholder="Search name, ID, address..."
                 className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
          </div>
          {/* City Filter Dropdown */}
          <div>
            <label htmlFor="cityFilter" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              id="cityFilter"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              disabled={isLoadingCities}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
            >
              <option value="ALL">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          {/* Status Filter Dropdown */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {customerStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'All Statuses' : (status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' '))}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* --------------------------- */}

      {/* Customer Table/List Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">All Customers</h3>
            <span className="text-sm text-gray-500">{filteredCustomers.length} customers</span>
          </div>
        </div>
        {/* Card Content - List */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
             <div className="p-12 text-center text-gray-500">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <User className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">No customers found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-4 md:p-6 hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer group"
                onClick={() => handleCustomerClick(customer)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* ... (Avatar) ... */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate" title={customer.name}>{customer.name}</h3>
                        <span className={`capitalize text-xs px-2 py-0.5 rounded-full border ${getStatusColor(customer.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(customer.status)} mr-1.5 inline-block`}></span>
                          {customer.status}
                        </span>
                        <span className="text-xs text-gray-400">#{customer.id}</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5" title={customer.address}>
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{customer.address ? customer.address.split(',')[0] : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wifi className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{customer.plan}</span>
                        </div>
                        {/* Uptime Removed */}
                      </div>
                    </div>
                  </div>
                  {/* Action */}
                  <div className="flex items-center gap-4 ml-4">
                     {/* Monthly Fee Removed */}
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Details Sheet (Modal) */}
      <Modal
        isOpen={sheetOpen}
        onRequestClose={() => setSheetOpen(false)}
        contentLabel="Customer Details"
        className="relative z-50 w-full sm:max-w-2xl h-full bg-white shadow-xl ml-auto outline-none"
        overlayClassName="fixed inset-0 bg-black/30 z-40"
      >
        {selectedCustomer && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-6 border-b bg-gradient-to-br from-slate-50 to-white">
               <div className="flex items-start justify-between gap-4">
        
        {/* Left Side: Avatar + Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0"> {/* Added flex-1 and min-w-0 */}
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white text-xl font-medium">
              {selectedCustomer.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0"> {/* Added flex-1 and min-w-0 */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 truncate" title={selectedCustomer.name}>
              {selectedCustomer.name}
            </h2>
            <div className="flex items-center flex-wrap gap-3"> {/* Added flex-wrap */}
              <span className={`capitalize text-xs px-2 py-0.5 rounded-full border ${getStatusColor(selectedCustomer.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedCustomer.status)} mr-1.5 inline-block`}></span>
                {selectedCustomer.status}
              </span>
              <span className="text-sm text-gray-500 whitespace-nowrap">Customer ID: {selectedCustomer.id}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Bandwidth + Close Button */}
        <div className="flex items-start gap-3 flex-shrink-0">
          
          {/* Close Button */}
          <button onClick={() => setSheetOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

      </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              
              {/* Quick Stats - Uptime and Monthly Fee Removed */}
              <div className="grid grid-cols-1 gap-3"> {/* Changed to 1 col, or keep 3 and find new stats */}
                 <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100">
                   <div className="flex items-center gap-2 mb-2">
                     <Zap className="w-4 h-4 text-blue-600" />
                     <span className="text-xs font-semibold text-blue-700">Bandwidth</span>
                   </div>
                   {/* Assume bandwidth is part of plan or needs to be fetched */}
                   <p className="text-lg font-bold text-blue-900">{selectedCustomer.plan || 'N/A'}</p>
                 </div>
                 {/* Uptime and Monthly Fee cards removed */}
              </div>

              {/* Contact Information - Email Removed */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Contact Information</h3>
                </div>
                <div className="bg-white border rounded-xl p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">Address</p>
                      <p className="text-sm text-gray-900">{selectedCustomer.address}</p>
                    </div>
                  </div>
                  <hr className="my-2 border-gray-100"/>
                  <div className="grid grid-cols-1 gap-4"> {/* Changed to 1 col */}
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                        {/* Need to add phone to CustomerDTO/Entity */}
                        <p className="text-sm text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                      </div>
                    </div>
                    {/* Email field removed */}
                  </div>
                </div>
              </div>

              {/* Service Details - Uptime/Fee Removed */}
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center border border-purple-200">
                     <Wifi className="w-4 h-4 text-purple-600" />
                   </div>
                   <h3 className="text-base font-semibold text-gray-900">Service Details</h3>
                 </div>
                 <div className="bg-white border rounded-xl p-4 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div><p className="text-xs text-gray-500 mb-0.5">Service Plan</p><p className="text-sm font-medium text-gray-900">{selectedCustomer.plan}</p></div>
                     <div><p className="text-xs text-gray-500 mb-0.5">Connection Type</p><p className="text-sm font-medium text-gray-900">{selectedCustomer.connectionType}</p></div>
                   </div>
                   {/* Monthly Fee / Uptime removed */}
                 </div>
              </div>

              {/* Network Assets (Requires fetching assigned assets) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center border border-emerald-200">
                    <Network className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Network Assets (Basic Info)</h3>
                </div>
                <div className="bg-white border rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      {/* These details (FDH, Splitter, Port) are now on the CustomerDTO */}
                      <div><p className="text-xs text-gray-500 mb-0.5">FDH</p><p className="text-sm font-medium text-gray-900 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{selectedCustomer.fdhName || (selectedCustomer.status === 'PENDING' ? 'Not Assigned' : 'N/A')}</p></div> {/* Assume fdhName */}
                      <div><p className="text-xs text-gray-500 mb-0.5">Splitter</p><p className="text-sm font-medium text-gray-900 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{selectedCustomer.splitterModel || 'N/A'}</p></div>
                      <div><p className="text-xs text-gray-500 mb-0.5">Port Number</p><p className="text-sm font-medium text-gray-900 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>{selectedCustomer.assignedPort || 'N/A'}</p></div>
                      {/* Need to fetch assigned ONT/Router S/N from /assigned-assets/by-customer/{id} */}
                      {isFetchingDetails ? (
                        <p className="text-sm text-gray-500 sm:col-span-2">Loading assigned devices...</p>
                      ) : (
                        assignedAssets.map(asset => (
                          <div key={asset.assetId}>
                            <p className="text-xs text-gray-500 mb-0.5">{asset.assetType}</p>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2" title={asset.model}>
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              {asset.serialNumber || 'N/A'}
                            </p>
                          </div>
                        ))
                      )}
                      {/* Show if ACTIVE but no assets found */}
                      {!isFetchingDetails && selectedCustomer.status === 'ACTIVE' && assignedAssets.length === 0 && (
                          <p className="text-sm text-red-500 sm:col-span-2">No ONT/Router assets found (Data issue).</p>
                      )}
                  </div>
                </div>
              </div>

              {/* Timeline - Last Active Removed */}
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center border border-orange-200">
                     <Calendar className="w-4 h-4 text-orange-600" />
                   </div>
                   <h3 className="text-base font-semibold text-gray-900">Account Timeline</h3>
                 </div>
                 <div className="bg-white border rounded-xl p-4">
                   <div className="grid grid-cols-1 gap-4"> {/* Changed to 1 col */}
                     <div><p className="text-xs text-gray-500 mb-0.5">Creation Date</p><p className="text-sm font-medium text-gray-900">{selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}</p></div>
                     {/* Last Active field removed */}
                   </div>
                 </div>
              </div>
            </div>
            {/* End Scrollable Content */}
            {/* End Scrollable Content */}

         

          </div>
        )}
      </Modal>
      {/* End Customer Details Sheet */}

    </div>
  );
}