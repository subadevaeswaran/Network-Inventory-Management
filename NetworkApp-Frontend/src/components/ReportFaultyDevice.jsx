// src/components/ReportFaultyDevice.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient'; // Your axios instance
// Pass 'user' as a prop from App.jsx
// import { useUser } from '../context/UserContext'; // Or use context
import { Search, AlertCircle, CheckCircle2, Upload, Calendar, Router as RouterIcon, Wifi, Package, Network, MapPinIcon, User, Clock, FileText, ChevronRight, Shuffle, Radio, Cable, ArrowRightLeft , AlertTriangle } from 'lucide-react';

// --- Helper Components ---
const Badge = ({ className, children }) => (
  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${className || ''}`}>
    {children}
  </span>
);

const Button = ({ children, variant, size, className, onClick, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  let variantStyle = "bg-blue-600 text-white hover:bg-blue-700";
  if (variant === 'outline') {
    variantStyle = "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700";
  }
  let sizeStyle = "px-4 py-2";
  if (size === 'sm') {
    sizeStyle = "px-3 py-1.5 text-xs";
  }
  return (
    <button type="button" className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const Label = ({ htmlFor, children, className }) => ( <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className || ''}`}>{children}</label> );
const Input = ({ id, type = 'text', ...props }) => ( <input type={type} id={id} {...props} className={`w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${props.className || ''}`} /> );
const Textarea = ({ id, ...props }) => ( <textarea id={id} {...props} className={`w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${props.className || ''}`} /> );
const Select = ({ children, ...props }) => ( <select {...props} className={`w-full mt-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 ${props.className || ''}`}>{children}</select> );
// --- End UI Helpers ---

// --- Main Component ---
export default function ReportFaultyDevice({ user }) { // Accept user as prop
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null); // The FAULTY device
  const [availableReplacements, setAvailableReplacements] = useState([]); // List for dropdown
  
  // Form fields
  const [selectedReplacementId, setSelectedReplacementId] = useState(''); // ID of the NEW device
  const [faultType, setFaultType] = useState('');
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [reportedDate, setReportedDate] = useState(new Date().toISOString().split('T')[0]);

const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingReplacements, setIsFetchingReplacements] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Set a timer to update the debounced query 500ms after user stops typing
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400); // 500ms delay

    // Cleanup function to cancel the timer
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

const handleDeviceSelect = (device) => {
    setSelectedDevice(device); // Set the clicked device
    setIsSubmitted(false);      // Hide any old success messages
    handleResetForm();          // Clear the fault report form fields
  };
  // --- Search for the FAULTY device ---
 useEffect(() => {
    // Don't search if a device is already selected
    if (selectedDevice || isSubmitted) return;

    // Only search if the query is not empty
    if (debouncedQuery.trim() !== '') {
      const fetchDevices = async () => {
          setIsSearching(true);
          try {
              // Call the new search endpoint
              const response = await apiClient.get(`/assets/search-swappable?query=${debouncedQuery}`);
              setSearchResults(Array.isArray(response.data) ? response.data : []);
          } catch (error) {
              toast.error("Failed to search devices.");
              console.error("Search devices error:", error);
          } finally {
              setIsSearching(false);
          }
      };
      fetchDevices();
    } else {
      setSearchResults([]); // Clear results if query is empty
    }
  }, [debouncedQuery, selectedDevice, isSubmitted]);
  // --- Fetch REPLACEMENT devices when a faulty device is selected ---
  useEffect(() => {
    if (selectedDevice) {
      const fetchReplacements = async () => {
        setIsFetchingReplacements(true);
        try {
          const response = await apiClient.get(`/assets/available?type=${selectedDevice.assetType}`);
          setAvailableReplacements(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          toast.error(`Failed to load available ${selectedDevice.assetType}s.`);
        } finally {
          setIsFetchingReplacements(false);
        }
      };
      fetchReplacements();
    }
  }, [selectedDevice]);

  // --- SUBMIT the SWAP ---
  const handleSubmit = async () => {
    if (!faultType || !priority || !description.trim() || !selectedReplacementId) {
      toast.error('Please fill in all required fields, including selecting a replacement device.');
      return;
    }
    if (!user || !user.id) {
        toast.error("Error: Logged-in user not found. Please re-login.");
        return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      faultyAssetId: selectedDevice.id,
      replacementAssetId: parseInt(selectedReplacementId, 10),
      faultType: faultType,
      priority: priority,
      description: description,
      reportedDate: reportedDate,
      operatorId: user.id // Pass logged-in user's ID
    };

    try {
      const response = await apiClient.post('/devices/report-and-swap', payload);
      
      const newTicketId = `#FR-SWAP-${Math.floor(1000 + Math.random() * 9000)}`; // Mock ticket ID
      setTicketId(newTicketId);
      setIsSubmitted(true); // Show success screen
      
      toast.success(response.data.message || 'Device swap successful!');
      
    } catch (error) {
      console.error("Failed to submit swap:", error);
      toast.error(error.response?.data?.message || 'Failed to submit swap.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the entire page
const handleResetForm = () => {
    setFaultType('');
    setPriority('');
    setDescription('');
    setSelectedReplacementId('');
    setUploadedFile(null);
    setReportedDate(new Date().toISOString().split('T')[0]);
  };


const handleReportAnother = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults([]);
    setSelectedDevice(null);
    setAvailableReplacements([]);
    setIsSubmitted(false);
    setTicketId('');
    handleResetForm();
  };

  // --- Helper functions for styling ---
  const getDeviceIcon = (type) => { /* ... (as in your code) ... */ };
  const getPriorityColor = (priorityLevel) => { /* ... (as in your code) ... */ };
  const getDeviceTypeColor = (type) => { /* ... (as in your code) ... */ };
  const getStatusColor = (status) => { // Simpler status badge
    status = String(status).toUpperCase();
    if (status === 'AVAILABLE') return 'bg-green-100 text-green-700 border border-green-200';
    if (status === 'ASSIGNED') return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (status === 'FAULTY') return 'bg-red-100 text-red-700 border border-red-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };
  // ------------------------------------

  // --- Main Render ---
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Report & Swap Faulty Device</h1>
        <p className="text-sm text-gray-600">
          Search for an assigned ONT or Router to report a fault and swap it.
        </p>
      </div>

      {/* --- State 1: Search Section (Always visible) --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Search className="w-5 h-5 text-blue-600" />
            1. Find Assigned Device
          </h3>
        </div>
        <div className="p-6">
          <Label htmlFor="deviceSearch" className="mb-2">Search by Serial Number</Label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <Input
                id="deviceSearch"
                placeholder="Enter Serial Number of faulty device (e.g., ONT-SN1234)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 h-11"
              />
            </div>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} variant="outline" className="px-6 h-11">
                Clear
              </Button>
            )}
           
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            {/* --- UPDATE: Use 'allDevices' for count --- */}
            <span>Found {searchResults.length} device{searchResults.length !== 1 ? 's' : ''}</span>
            {isSearching && <span className="text-xs text-blue-600">(Searching...)</span>}
          </div>
        </div>
      </div>

      {/* Conditional Content Area */}
      <div className="min-h-[400px]">
        {/* State 1: Show Device List */}
        {!selectedDevice && !isSubmitted && (
          <div>
            {isSearching && searchResults.length===0 ? (
                <div className="text-center py-10 text-gray-500">Searching...</div>
            ) : !isSearching && searchResults.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-dashed">
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for an Assigned Device</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {searchQuery ? "No devices match your search." : "Start typing a serial number to find a device."}
                    </p>
                  </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* --- Map over 'allDevices' --- */}
                  {searchResults.map((device) => (
                    <div
                      key={device.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-500/30 transition-all cursor-pointer group"
                      onClick={() => handleDeviceSelect(device)}
                    >
                      {/* --- Start of Device Card JSX --- */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 ${getDeviceTypeColor(device.assetType)} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                            {getDeviceIcon(device.assetType)}
                          </div>
                          {/* Use getStatusColor helper for the badge */}
                          <Badge className={getStatusColor(device.status)}>
                            {device.status}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">{device.assetType}</h3>
                            <p className="text-sm font-medium text-blue-600 truncate" title={device.serialNumber}>{device.serialNumber}</p>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2 text-gray-600">
                              <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <p>{device.location}</p>
                            </div>
                            {/* Customer info is not in the AssetDTO, so we can't show it here */}
                          </div>

                          <Button
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 h-10 transition-all group-hover:shadow-md"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click from triggering twice
                              handleDeviceSelect(device);
                            }}
                          >
                            Report Fault
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                      {/* --- End of Device Card JSX --- */}
                    </div>
                  ))}
                </div>
            )}
          </div>
        )}
        </div>

      

      {/* --- State 2: Show Fault Report Form (if device found) --- */}
      {selectedDevice && !isSubmitted && (
        <div className="space-y-6 animate-fadeIn">
          <Button
              onClick={() => {
                  setSelectedDevice(null); // Go back
                  // We don't clear searchQuery, so results reappear
              }}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              &larr; Back to Device List
            </Button>
          {/* Device Details Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
             <div className="bg-gradient-to-r from-red-50/50 to-transparent p-6 border-b border-gray-200">
               <div className="flex items-start justify-between">
                 <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0 border border-red-200">
                     <AlertTriangle className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-xs text-red-700 font-semibold">Faulty Device Selected</p>
                     <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedDevice.serialNumber}</h3>
                     <p className="text-sm text-gray-600">{selectedDevice.assetType} - {selectedDevice.model}</p>
                   </div>
                 </div>
                 <Badge className={`${getStatusColor(selectedDevice.status)}`}>
                   {selectedDevice.status}
                 </Badge>
               </div>
             </div>
          </div>

          {/* Fault Reporting Form Card */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50/50">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="w-5 h-5 text-gray-600" />
                2. Report Details & Select Replacement
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- New Replacement Dropdown --- */}
                <div className="space-y-1 md:col-span-2">
                   <Label htmlFor="replacement-device">Select Replacement Device <span className="text-red-500">*</span></Label>
                   <Select
                     id="replacement-device"
                     value={selectedReplacementId}
                     onChange={(e) => setSelectedReplacementId(e.target.value)}
                     disabled={isFetchingReplacements || availableReplacements.length === 0}
                     required
                   >
                     <option value="" disabled>
                       {isFetchingReplacements ? 'Loading available devices...' : (availableReplacements.length === 0 ? `No available ${selectedDevice.assetType}s found` : 'Select replacement...')}
                     </option>
                     {availableReplacements.map(device => (
                       <option key={device.id} value={device.id}>
                         {device.serialNumber} ({device.model}) - Location: {device.location}
                       </option>
                     ))}
                   </Select>
                </div>
                {/* ------------------------------- */}

                <div className="space-y-1">
                  <Label htmlFor="fault-type">Fault Type <span className="text-red-500">*</span></Label>
                  <Select id="fault-type" value={faultType} onChange={(e) => setFaultType(e.target.value)} required>
                    <option value="" disabled>Choose fault type</option>
                    <option value="power-failure">Power Failure</option>
                    <option value="connection-drop">Connection Drop</option>
                    <option value="overheating">Overheating</option>
                    <option value="hardware-damage">Hardware Damage</option>
                    <option value="other">Other</option>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="priority">Priority Level <span className="text-red-500">*</span></Label>
                  <Select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} required>
                    <option value="" disabled>Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </Select>
                  {priority && (
                    <Badge className={`${getPriorityColor(priority)} mt-2`}>
                      {priority} Priority
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="description">Describe the Issue <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reported-date">Reported On</Label>
                  <Input type="date" id="reported-date" value={reportedDate} onChange={(e) => setReportedDate(e.target.value)} className="h-11" />
                </div>
                
                {/* File Upload (Hidden for now, logic exists) */}
                {/* <div className="space-y-1"> ... </div> */}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 md:col-span-2">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
                    disabled={isSubmitting || isFetchingReplacements || !selectedReplacementId || !faultType || !priority || !description}
                  >
                    {isSubmitting ? 'Submitting...' : <><ArrowRightLeft className="w-4 h-4 mr-2" />Submit & Swap</>}
                  </Button>
                  <Button
                    onClick={handleReportAnother}
                    variant="outline"
                    className="px-8 h-11"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State 3: Success Message */}
      {isSubmitted && selectedDevice && (
        <div className="animate-fadeIn">
          <div className="bg-white rounded-lg shadow-lg border border-green-200">
             <div className="p-8 text-center">
               <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 className="w-8 h-8 text-white" />
               </div>
               <h2 className="text-2xl font-semibold text-green-900 mb-2">Swap Successful</h2>
               <p className="text-gray-600 mb-6">Device <strong>{selectedDevice.serialNumber}</strong> has been marked FAULTY.</p>

               <div className="bg-white border border-green-200 rounded-xl p-6 space-y-3 mb-6 text-left text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ticket ID:</span>
                    <span className="font-semibold text-green-700">{ticketId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Faulty Device:</span>
                    <span className="font-semibold text-gray-900">{selectedDevice.serialNumber}</span>
                  </div>
                   <div className="flex items-center justify-between">
                    <span className="text-gray-600">New Device:</span>
                    <span className="font-semibold text-gray-900">{availableReplacements.find(d => d.id === parseInt(selectedReplacementId))?.serialNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <Badge className={getPriorityColor(priority)}>
                      {priority}
                    </Badge>
                  </div>
               </div>

               <div className="flex gap-3 justify-center">
                 <Button onClick={handleReportAnother} className="bg-blue-600 hover:bg-blue-700">
                   Report Another Device
                 </Button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

