// src/components/Inventory.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal'; // Keep react-modal
import { Plus, Upload, Trash2, X } from 'lucide-react'; // Keep lucide-react icons
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import SelectAssetTypeModal from './SelectAssetTypeModal'; // <-- Import Type Select Modal
import AddFdhModal from './AddFdhModal';           // <-- Import FDH Modal (ensure it exists)
import AddGenericAssetModal from './AddGenericAssetModal';
import AddSplitterModal from './AddSplitterModal';

Modal.setAppElement('#root'); // For react-modal accessibility

// Define constants for Asset Types and Statuses (matching backend enums)
const assetTypes = ['ONT', 'ROUTER', 'SPLITTER', 'FDH', 'FIBERROLL'];
const assetStatuses = ['ALL', 'AVAILABLE', 'ASSIGNED', 'FAULTY', 'RETIRED'];

export default function Inventory() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('ONT');
  const [statusFilter, setStatusFilter] = useState('ALL');
// --- NEW: State for modal workflow ---
  const [isTypeSelectModalOpen, setIsTypeSelectModalOpen] = useState(false);
  const [assetTypeToAdd, setAssetTypeToAdd] = useState(null); // Type selected in first modal
  const [isAddFdhModalOpen, setIsAddFdhModalOpen] = useState(false);
  const [isAddGenericAssetModalOpen, setIsAddGenericAssetModalOpen] = useState(false);
  // ------------------------------------
  // State for the "Add Asset" dialog/modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAssetType, setNewAssetType] = useState('ONT');
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isAddingAsset, setIsAddingAsset] = useState(false); // Separate loading state for add
  const [isAddSplitterModalOpen, setIsAddSplitterModalOpen] = useState(false); // <-- Add state

  // --- Fetch assets ---
  const fetchAssets = async (type = currentTab, status = statusFilter) => {
    setIsLoading(true);
    try {
      const params = { type };
      if (status !== 'ALL') {
        params.status = status;
      }
      const response = await apiClient.get('/assets', { params });
      setAssets(response.data);
    } catch (error) {
      toast.error('Failed to fetch assets.');
      console.error("Fetch assets error:", error);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [currentTab, statusFilter]);


  // --- NEW: Handler for when type is selected in the first modal ---
  const handleTypeSelected = (selectedType) => {
    setAssetTypeToAdd(selectedType); // Store the selected type
    setIsTypeSelectModalOpen(false); // Close the first modal

    // Open the corresponding data entry modal
    if (selectedType === 'FDH') {
      setIsAddFdhModalOpen(true);
    } else if (selectedType === 'SPLITTER') {
       setIsAddSplitterModalOpen(true);
       toast.info("Add Splitter modal not yet implemented.");
    } else {
        setNewAssetType(selectedType);
      // For ONT, ROUTER, SWITCH, FIBERROLL
      setIsAddGenericAssetModalOpen(true);
    }
  };

  // --- Handle adding a new asset ---
  const handleAddAsset = async () => {
     if (!newAssetType || !newSerialNumber || !newModel || !newLocation) {
         toast.warning("Please fill in all asset details.");
         return;
     }
    setIsAddingAsset(true);
    try {
      const newAssetData = {
        assetType: newAssetType,
        serialNumber: newSerialNumber,
        model: newModel,
        status: 'AVAILABLE',
        location: newLocation,
      };
      await apiClient.post('/assets', newAssetData);
      toast.success('Asset added successfully');
      fetchAssets(newAssetType, statusFilter); // Refetch to show the new asset in its tab
      setNewSerialNumber('');
      setNewModel('');
      setNewLocation('');
      setIsAddModalOpen(false);
    } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to add asset.";
        toast.error(errorMsg);
        console.error("Add asset error:", error);
    } finally {
        setIsAddingAsset(false);
    }
  };
  const handleAssetAdded = (addedAsset) => {
      console.log("Asset added:", addedAsset);
      toast.success('Asset added successfully');
      // Refetch assets for the currently viewed tab
      fetchAssets(currentTab, statusFilter);
  };

  // --- Helper to style status badges ---
  const getStatusBadge = (status) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-700';
    switch (status) {
      case 'AVAILABLE': bgColor = 'bg-green-100'; textColor = 'text-green-700'; break;
      case 'ASSIGNED': bgColor = 'bg-blue-100'; textColor = 'text-blue-700'; break;
      case 'FAULTY': bgColor = 'bg-red-100'; textColor = 'text-red-700'; break;
      case 'RETIRED': bgColor = 'bg-gray-100'; textColor = 'text-gray-700'; break;
    }
    // Use span for Badge
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>{status}</span>;
  };

  const handleDeleteAsset = async (assetId, assetStatus, assetType,serialNumber) => {
      // Button disabled handles this, but belt-and-suspenders check
      if (assetStatus !== 'AVAILABLE') {
          toast.error(`Cannot delete: Status is '${assetStatus}'.`);
          return;
      }

      // Confirmation
      const confirmDelete = window.confirm(
          `DELETE ${assetType} (SN: ${serialNumber})?\n\n` +
          `Status: AVAILABLE\n` +
          `${(assetType === 'SPLITTER' || assetType === 'FDH') ? '\nWARNING: This will also attempt to delete the corresponding infrastructure record if it has no dependencies (e.g., assigned customers/splitters).\n' : ''}` +
          `\nThis action cannot be undone.`
      );
      if (!confirmDelete) return;

      // Optimistic UI Update (remove item immediately)
      const originalAssets = [...assets];
      setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
      // No global loading indicator needed for optimistic delete

      try {
          // Call the backend API
          await apiClient.delete(`/assets/${assetId}`);
          toast.success(`${assetType} (ID: ${serialNumber}) deleted successfully.`);
          // No refetch needed if optimistic update works

      } catch (error) {
          // Revert UI on error
          setAssets(originalAssets);

          let errorMsg = `Failed to delete ${assetType} (ID: ${assetId}).`;
          if (error.response) {
              // Use detailed error message from backend if available
              errorMsg = typeof error.response.data === 'string' && error.response.data.length > 0
                         ? error.response.data
                         : `Error: ${error.response.status} - ${error.response.statusText}`;
              if (error.response.status === 409) { // Conflict
                  errorMsg = `Cannot delete: ${error.response.data || 'Asset is in use or has dependencies.'}`;
              } else if (error.response.status === 400) { // Bad Request (e.g., wrong status)
                  errorMsg = `Cannot delete: ${error.response.data || 'Asset status prevents deletion.'}`;
              } else if (error.response.status === 404) { // Not Found
                   errorMsg = error.response.data || `Asset (ID: ${assetId}) not found.`;
              }
          }
          console.error("Delete asset error:", error);
          toast.error(errorMsg);
          // Consider refetching here if state might be truly inconsistent
          // fetchAssets(currentTab, statusFilter);
      }
      // No finally setIsLoading needed for optimistic
  };
  

  // --- Render Table function using standard HTML ---
  const renderTable = (data) => (
    <div className="overflow-x-auto"> {/* Added for responsiveness */}
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Assigned</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
              <tr><td colSpan="6" className="text-center py-4 text-gray-500">Loading assets...</td></tr>
          ) : data.length === 0 ? (
               <tr><td colSpan="6" className="text-center py-4 text-gray-500">No assets found matching criteria.</td></tr>
          ): (
              data.map((item) => {
                const isDeletable = item.status === 'AVAILABLE';
                return(
                <tr key={item.serialNumber} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.serialNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.assignedDate ? new Date(item.assignedDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {/* Use button elements */}
                    {/* <button className="text-blue-600 hover:text-blue-800 text-xs py-1 px-2 rounded hover:bg-blue-50">Edit</button> */}
                          {/* --- Conditionally Styled Delete Button --- */}
                          {isDeletable && ( // Only render the button if the status is AVAILABLE
                        <button
                          onClick={() => handleDeleteAsset(item.id, item.status, item.assetType)}
                          className='text-red-600 hover:text-red-800 text-xs py-1 px-2 rounded hover:bg-red-50 cursor-pointer'
                          title="Delete Asset"
                        >
                          <Trash2 className="w-4 h-4 inline-block" />
                        </button>
                      )}
                      {!isDeletable && ( // Only render the button if the status is AVAILABLE
                        <button onClick={()=>{toast.error('Cannot Delete an asset which is assigned')}}
                          
                          className='text-gray-400 hover:text-gray-500 text-xs py-1 px-2 rounded hover:bg-grey-300 cursor-not-allowed'
                          title="Delete Asset"
                        >
                          <Trash2 className="w-4 h-4 inline-block" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-2"> {/* Added padding */}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Inventory Management</h2>
          <p className="text-sm text-gray-600">Manage all network equipment and assets</p>
        </div>
        <div className="flex gap-3">
          {/* Bulk Upload Button (Modal UI Only) */}
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </button>

          {/* Add New Asset Button */}
          <button
            onClick={() => setIsTypeSelectModalOpen(true)}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </button>
        </div>
      </div>

      {/* Main Content Card (using div) */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Card Header */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Asset Inventory</h3>
            <div className="flex gap-4 items-center">
              {/* Status Filter Select (using standard select) */}
              <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 block border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                 {assetStatuses.map(status => (
                     <option key={status} value={status}>
                         {status === 'ALL' ? 'All Statuses' : status}
                     </option>
                 ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 md:p-6">
           {/* Tabs (using divs and buttons) */}
           <div>
               {/* Tab Buttons */}
               <div className="border-b border-gray-200">
                   <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                      {assetTypes.map(type => (
                          <button
                            key={type}
                            onClick={() => setCurrentTab(type)}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none ${
                                currentTab === type
                                ? 'border-blue-500 text-blue-600' // Active tab style
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' // Inactive tab style
                            }`}
                          >
                            {type}
                          </button>
                      ))}
                   </nav>
               </div>

               {/* Tab Content Area (only render table) */}
               <div className="mt-6">
                   {renderTable(assets)}
               </div>
           </div>
        </div>
      </div>

       {/* Add New Asset Modal (using react-modal) */}
       <SelectAssetTypeModal
        isOpen={isTypeSelectModalOpen}
        onRequestClose={() => setIsTypeSelectModalOpen(false)}
        onTypeSelected={handleTypeSelected}
      />

      {/* Check if AddFdhModal is defined/imported before rendering */}
      {typeof AddFdhModal !== 'undefined' && (
        <AddFdhModal
          isOpen={isAddFdhModalOpen}
          onRequestClose={() => setIsAddFdhModalOpen(false)}
          // You might need a specific callback like onFdhAdded if AddFdhModal
          // doesn't return a standard Asset object for handleAssetAdded.
          // For now, let's assume it can trigger a general refresh via onRequestClose
          // or modify handleAssetAdded if needed.
           onFdhAdded={handleAssetAdded} // Assuming AddFdhModal calls this on success
        />
      )}

      <AddGenericAssetModal
        isOpen={isAddGenericAssetModalOpen}
        onRequestClose={() => setIsAddGenericAssetModalOpen(false)}
        onAssetAdded={handleAssetAdded} // Pass the callback
        assetType={assetTypeToAdd} // Pass the selected type
      />
      {/* --- Add Splitter Modal --- */}
       <AddSplitterModal
          isOpen={isAddSplitterModalOpen}
          onRequestClose={() => setIsAddSplitterModalOpen(false)}
            // Pass the callback
          onSplitterAdded={handleAssetAdded} // Use same callback to refresh list
       />

    </div>
  );
}