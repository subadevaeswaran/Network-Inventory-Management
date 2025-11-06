
import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, MapPin, Wifi, Network, Package, Router, CheckCircle2, AlertTriangle, X, ChevronDown, ChevronUp, Calendar, Phone, Mail, HomeIcon, Zap, Activity, Clock, DollarSign } from 'lucide-react';
import Modal from 'react-modal';
import { toast } from 'sonner';
import apiClient from '../api/apiClient';

// Set modal app element
Modal.setAppElement('#root');

// --- Helper components to replace shadcn/ui ---
const Label = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className || ''}`}>
        {children}
    </label>
);

const Input = ({ id, type = 'text', placeholder, value, onChange, onKeyPress, className }) => (
    <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        className={`w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${className || ''}`}
    />
);

const Textarea = ({ id, placeholder, rows, value, onChange, className }) => (
    <textarea
        id={id}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange}
        className={`w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${className || ''}`}
    />
);

const Select = ({ children, value, onChange, id, disabled }) => (
    <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100"
    >
        {children}
    </select>
);

const Option = ({ children, ...props }) => ( // Fixed 'Goption' typo
    <option {...props}>{children}</option>
);
// --- End Helper Components ---


// --- Mock Data (from your reference) ---
const dummyCustomers = [
  { id: 'CUST-12345', name: 'House A1.2', address: '123 Main Street, Building A1, Unit 2, Zone A', phone: '+1 555-0100', email: 'contact@housea12.com', status: 'active', connectionType: 'Fiber Broadband', plan: 'Ultra 500 Mbps', ontId: 'ONT-SN1240', routerId: 'RTR-WN2100', fdh: 'FDH-A1', splitter: 'SPL-1-8', port: 'Port 4', fiberPath: 'Zone A → FDH-A1 → Splitter 1:8 → Port 4 → House A1.2', installDate: '2024-02-10', monthlyFee: '$89.99', bandwidth: '500 Mbps', uptime: '99.8%', lastActive: '2024-10-30' },
  { id: 'CUST-12346', name: 'Oak Street Apartment 5B', address: '456 Oak Street, Apartment 5B, Zone B', phone: '+1 555-0101', email: 'resident5b@oak.com', status: 'active', connectionType: 'Fiber Broadband', plan: 'Standard 100 Mbps', ontId: 'ONT-SN1241', routerId: 'RTR-WN2101', fdh: 'FDH-B1', splitter: 'SPL-1-16', port: 'Port 7', fiberPath: 'Zone B → FDH-B1 → Splitter 1:16 → Port 7 → Apartment 5B', installDate: '2024-03-15', monthlyFee: '$49.99', bandwidth: '100 Mbps', uptime: '99.9%', lastActive: '2024-10-30' },
  { id: 'CUST-12347', name: 'Tech Startup Office', address: '321 Innovation Drive, Suite 200, Zone C', phone: '+1 555-0321', email: 'admin@techstartup.io', plan: 'Ultra 500 Mbps', connectionType: 'GPON', status: 'pending', fdh: 'FDH-C1', splitter: 'SPL-1-16', port: 'Port 2', ont: 'ONT-SN1237', routerId: 'R1-WN1203', installDate: '2024-10-25', lastActive: 'N/A', monthlyFee: '$89.99', uptime: 'N/A', bandwidth: '500 Mbps' },
  { id: 'CUST-12348', name: 'Downtown Medical Center', address: '987 Health Street, Medical Plaza, Zone C', phone: '+1 555-0987', email: 'it@medicalcenter.org', plan: 'Premium 200 Mbps', connectionType: 'FTTB', status: 'inactive', fdh: 'FDH-C1', splitter: 'SPL-1-32', port: 'Port 15', ont: 'ONT-SN1239', routerId: 'R1-WN1205', installDate: '2024-06-12', lastActive: '2024-09-15', monthlyFee: '$69.99', uptime: '98.8%', bandwidth: '200 Mbps' }
];

// --- Helper functions for status styling ---
const getStatusColor = (status) => {
  status = String(status).toUpperCase();
  switch (status) {
    case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING': case 'SCHEDULED': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'INACTIVE': return 'bg-slate-50 text-slate-700 border-slate-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
const getStatusDot = (status) => {
  status = String(status).toUpperCase();
  switch (status) {
    case 'ACTIVE': return 'bg-emerald-500';
    case 'PENDING': case 'SCHEDULED': return 'bg-amber-500';
    case 'INACTIVE': return 'bg-slate-400';
    default: return 'bg-slate-400';
  }
};

// --- Main Component ---
export default function SupportAgentView({user}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [allCustomers, setAllCustomers] = useState([]);
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [exitNotes, setExitNotes] = useState('');
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false); // For details panel
  
  // Use dummy data for now
  const [customers, setCustomers] = useState([]); 
  // const [customers, setCustomers] = useState([]); // Use this for API
  const [isLoading, setIsLoading] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  


  // --- Fetch ALL customers on component mount ---
  useEffect(() => {
    const fetchAllCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/customer'); // Fetch all
        const customerData = Array.isArray(response.data) ? response.data : [];
        setAllCustomers(customerData); // Store the master list
        setCustomers(customerData); // Start with empty search results
      } catch (error) {
        toast.error("Failed to load customer data.");
        console.error("Fetch all customers error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllCustomers();
  }, []); // Run once on mount

  // --- Fetch assigned asset details when modal opens ---
  useEffect(() => {
    if (selectedCustomer) {
      setAssignedAssets([]);
      const status = String(selectedCustomer.status).toUpperCase();
      if (status === 'ACTIVE' || status === 'SCHEDULED') {
        const fetchAssignedAssets = async () => {
          setIsFetchingDetails(true);
          try {
             const response = await apiClient.get(`/assigned-assets/by-customer/${selectedCustomer.id}`);
             setAssignedAssets(Array.isArray(response.data) ? response.data : []);
          } catch (error) { toast.error("Failed to load customer's assigned assets."); }
          finally { setIsFetchingDetails(false); }
        };
        fetchAssignedAssets();
      } else {
         setIsFetchingDetails(false);
      }
    }
  }, [selectedCustomer]);

  // --- Search Handler (Filters the 'allCustomers' list) ---
  const handleSearch = () => {
    if (!searchQuery) {
        toast.info("Please enter a name, ID, or address to search.");
        setCustomers([]); // Clear results if search is empty
        return;
    }
    setIsLoading(true); // Show loading feedback
    setSelectedCustomer(null);
    setIsDeactivated(false);
    
    // Simulating search delay
    setTimeout(() => {
      const filtered = customers.filter(c => 
          (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (c.id && String(c.id).toLowerCase().includes(searchQuery.toLowerCase())) || // Fixed .toLowerCase on number
          (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setCustomers(filtered); // Set search results
      if (filtered.length === 0) {
          toast.error("No customers found matching that query.");
      }
      setIsLoading(false);
    }, 300);
  };

  const handleSearchChange = (e) =>{
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedCustomer(null); // Clear selection when search changes
    setIsDeactivated(false); // Clear deactivation message

    if (!query) {
      // If search is empty, show all customers
      setCustomers(allCustomers);
      return;
    }

    // Filter the master list
    const filtered = allCustomers.filter(c => 
        (c.name && c.name.toLowerCase().includes(query.toLowerCase())) ||
        (c.id && String(c.id).toLowerCase().includes(query.toLowerCase())) ||
        (c.address && c.address.toLowerCase().includes(query.toLowerCase()))
    );
    setCustomers(filtered); // Set search results
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // --- Deactivation Handler ---
  const handleDeactivate = async () => {
    
    if (!deactivationReason) {
      toast.error('Please select a reason for deactivation');
      return;
    }
    setIsDeactivating(true);
    console.log(user);
      try {
      await apiClient.delete(`/customer/${selectedCustomer.id}`);
        
      setIsDeactivated(true);
  
      setSelectedCustomer(null);
      setShowDeactivateModal(false);
      setSheetOpen(false); // Close the side panel
    
      setSearchQuery('');
      setDeactivationReason('');
      setExitNotes('');
      toast.success('Customer Deactivated Successfully', {
        description: 'Assets marked for collection and status set to INACTIVE.'
      });
      
      // Refresh the master list after deactivation
      const response = await apiClient.get('/customer');
      const customerData = Array.isArray(response.data) ? response.data : [];
      setAllCustomers(customerData);
      setCustomers(customerData);
    } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to deactivate customer.";
        toast.error(errorMsg);
        console.error("Deactivation error:", error);
    } finally {
        setIsDeactivating(false);
    }
  };

  // --- Customer Selection Handler ---
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setIsDeactivated(false);
    setShowConnectionDetails(false);
    setSheetOpen(true); 
  };
  
  const handleCloseSheet = () => {
      setSheetOpen(false);
      setSelectedCustomer(null);
  };
 




  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Deactivate Customer & Reclaim Assets</h2>
        <p className="text-sm text-gray-500">Find and deactivate customer connections, reclaim network assets</p>
      </div>

    {/* Search Section Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <Label htmlFor="customerSearch" className="mb-2">Find Customer</Label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <Input
                id="customerSearch"
                placeholder="Search customer by name, ID, or address..."
                className="pl-10 h-12" // h-12 matches button height
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="h-12 px-6 flex items-center justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Searching...' : <><Search className="w-4 h-4 mr-2" /> Search</>}
            </button>
          </div>
        </div>
      </div>

      {isDeactivated && (
         <div className="bg-white rounded-lg shadow border-2 border-emerald-200 animate-fadeIn">
            {/* ... (Success Message JSX) ... */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-2">Customer Deactivated</h3>
                  <p className="text-sm text-emerald-800">The customer account is now INACTIVE.</p>
                </div>
                <button onClick={() => setIsDeactivated(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
         </div>
      )}

      {/* Customer Details Card (if one is selected) */}
      {!selectedCustomer && !isDeactivated && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">{searchQuery ? 'Search Results' : 'All Customers'}</h3>
              <span className="text-sm text-gray-500">{customers.length} {customers.length === 1 ? 'customer' : 'customers'} found</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {isLoading && customers.length === 0 ? (
                <div className="p-12 text-center text-gray-500">Searching...</div>
            ) : !isLoading && customers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border">
                  <User className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">Search for a Customer</p>
                <p className="text-sm text-gray-500">Enter a Customer ID, Name, or Address to begin.</p>
              </div>
            ) : (
                customers.map((customer) => ( // <-- Use 'customers' state
                  <div
                    key={customer.id}
                    className="p-6 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-white text-sm font-medium">
                            {customer.name ? customer.name.substring(0, 2).toUpperCase() : '??'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-gray-900 truncate">{customer.name}</h3>
                            <span className={`capitalize text-xs px-2 py-0.5 rounded-full border ${getStatusColor(customer.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(customer.status)} mr-1.5 inline-block`}></span>
                              {customer.status}
                            </span>
                            <span className="text-xs text-gray-400">#{customer.id}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /><span className="truncate max-w-xs">{customer.address ? customer.address.split(',')[0] : 'No Address'}</span></div>
                            <div className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" /><span>{customer.plan}</span></div>
                          </div>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Select
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}



      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={sheetOpen}
        onRequestClose={handleCloseSheet}
        contentLabel="Customer Details"
        className="relative z-50 w-full sm:max-w-2xl h-full bg-white shadow-xl ml-auto outline-none"
        overlayClassName="fixed inset-0 bg-black/30 z-40"
      >
        {selectedCustomer && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-6 border-b bg-gradient-to-br from-slate-50 to-white">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2">
                      <h3 className="text-2xl font-semibold text-gray-900">{selectedCustomer.name}</h3>
                      <span className={`capitalize text-xs px-2 py-0.5 rounded-full border ${getStatusColor(selectedCustomer.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(selectedCustomer.status)} mr-1.5 inline-block`}></span>
                        {selectedCustomer.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Customer ID: {selectedCustomer.id}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseSheet}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Quick Stats (Removed Uptime/Fee) */}
              <div className="grid grid-cols-1 gap-3">
                 <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100">
                   <div className="flex items-center gap-2 mb-2">
                     <Zap className="w-4 h-4 text-blue-600" />
                     <span className="text-xs font-semibold text-blue-700">Service Plan</span>
                   </div>
                   <p className="text-lg font-bold text-blue-900">{selectedCustomer.plan || 'N/A'}</p>
                 </div>
              </div>

              {/* Contact Info (Removed Email) */}
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
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Address</p>
                      <p className="text-sm text-gray-900">{selectedCustomer.address}</p>
                    </div>
                  </div>
                  <hr className="my-2 border-gray-100"/>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                        <p className="text-sm text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details (Removed Uptime/Fee) */}
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center border border-purple-200">
                     <Wifi className="w-4 h-4 text-purple-600" />
                   </div>
                   <h3 className="text-base font-semibold text-gray-900">Service Details</h3>
                 </div>
                 <div className="bg-white border rounded-xl p-4 space-y-4">
                   <div className="grid grid-cols-1 gap-4">
                     <div><p className="text-xs text-gray-500 mb-0.5">Connection Type</p><p className="text-sm font-medium text-gray-900">{selectedCustomer.connectionType}</p></div>
                   </div>
                 </div>
              </div>

              {/* Network Assets (Fetched) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center border border-emerald-200">
                    <Network className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Network Assets</h3>
                </div>
                <div className="bg-white border rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <div><p className="text-xs text-gray-500 mb-0.5">FDH</p><p className="text-sm font-medium text-gray-900 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${selectedCustomer.fdhName ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>{selectedCustomer.fdhName || 'N/A'}</p></div>
                      <div><p className="text-xs text-gray-500 mb-0.5">Splitter</p><p className="text-sm font-medium text-gray-900 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${selectedCustomer.splitterModel ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>{selectedCustomer.splitterModel || 'N/A'}</p></div>
                      <div><p className="text-xs text-gray-500 mb-0.5">Port Number</p><p className="text-sm font-medium text-gray-900 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${selectedCustomer.assignedPort > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>{selectedCustomer.assignedPort > 0 ? selectedCustomer.assignedPort : 'N/A'}</p></div>
                      <div></div> {/* Spacer */}
                      {isFetchingDetails ? ( <p className="text-sm text-gray-500 sm:col-span-2">Loading assigned devices...</p> ) 
                       : ( assignedAssets.map(asset => (
                          <div key={asset.assetId}>
                            <p className="text-xs text-gray-500 mb-0.5">{asset.assetType}</p>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2" title={asset.model}>
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              {asset.serialNumber || 'N/A'}
                            </p>
                          </div>
                        ))
                      )}
                  </div>
                </div>
              </div>

              {/* Timeline (Removed Last Active) */}
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center border border-orange-200">
                     <Calendar className="w-4 h-4 text-orange-600" />
                   </div>
                   <h3 className="text-base font-semibold text-gray-900">Account Timeline</h3>
                 </div>
                 <div className="bg-white border rounded-xl p-4">
                   <div className="grid grid-cols-1 gap-4">
                     <div><p className="text-xs text-gray-500 mb-0.5">Installation Date</p><p className="text-sm font-medium text-gray-900">{selectedCustomer.installDate || (selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A')}</p></div>
                   </div>
                 </div>
              </div>

              {/* Action Button */}
              {!isDeactivated && (
                <div className="border-t pt-6">
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-md shadow-lg hover:shadow-xl transition-all font-medium"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Deactivate Customer
                  </button>
                </div>
              )}
            </div>
            {/* End Scrollable Content */}
          </div>
        )}
      </Modal>
      {/* End Customer Details Sheet */}

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onRequestClose={() => setShowDeactivateModal(false)}
        contentLabel="Confirm Deactivation"
        className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
        overlayClassName="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
      >
       {selectedCustomer && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                   <AlertTriangle className="w-5 h-5 text-red-600" />
                 </div>
                 <h2 className="text-lg font-semibold text-gray-900">Confirm Deactivation</h2>
               </div>
               <button onClick={() => setShowDeactivateModal(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                    <X className="w-5 h-5" />
               </button>
            </div>
            {/* Content */}
            <div className="p-6 space-y-4">
               <p className="text-sm text-gray-600">
                 You are about to deactivate <strong>{selectedCustomer.name}</strong>.
               </p>
              <div>
                <Label htmlFor="reason" className="mb-1">Select Reason *</Label>
                <Select
                  id="reason"
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                >
                  <option value="" disabled>Choose a reason...</option>
                  <option value="customer-request">Customer Request</option>
                  <option value="non-payment">Non-Payment</option>
                  <option value="relocation">Customer Relocation</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes" className="mb-1">Exit Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  rows={3}
                  value={exitNotes}
                  onChange={(e) => setExitNotes(e.target.value)}
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                 <p className="text-xs text-amber-800">
                   <strong>Note:</strong> This will set the customer status to INACTIVE.
                 </p>
               </div>
            </div>
            {/* Footer */}
            <div className="p-4 flex gap-3 bg-gray-50 border-t">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isDeactivating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={!deactivationReason || isDeactivating}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-md shadow-sm font-medium hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeactivating ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </>
        )}
      </Modal>
      {/* End Modal */}
    </div>
  );
}