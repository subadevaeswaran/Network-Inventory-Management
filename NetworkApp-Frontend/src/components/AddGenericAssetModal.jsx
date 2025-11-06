// src/components/AddGenericAssetModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'sonner';
import apiClient from '../api/apiClient';
import { X } from 'lucide-react';

Modal.setAppElement('#root');

// Asset types this modal handles
const genericAssetTypes = ['ONT', 'ROUTER', 'SWITCH', 'FIBERROLL'];

const AddGenericAssetModal = ({ isOpen, onRequestClose, onAssetAdded, assetType }) => {
  // Form state
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens or assetType changes
  useEffect(() => {
    if (isOpen) {
      setSerialNumber('');
      setModel('');
      setLocation('');
    }
  }, [isOpen, assetType]); // Include assetType in dependency

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serialNumber || !model || !location) {
        toast.warning("Please fill in all asset details.");
        return;
    }
    setIsLoading(true);
    try {
      const newAssetData = {
        assetType: assetType, // Use the type passed via prop
        serialNumber: serialNumber,
        model: model,
        status: 'AVAILABLE', // Default
        location: location,
      };
      const response = await apiClient.post('/assets', newAssetData);
      toast.success(`${assetType} added successfully`);
      if (onAssetAdded) {
        onAssetAdded(response.data); // Callback
      }
      onRequestClose(); // Close modal
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Failed to add ${assetType}.`;
      toast.error(errorMsg);
      console.error(`Add ${assetType} error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={`Add New ${assetType}`} // Dynamic label
      className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
      overlayClassName="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-semibold text-gray-800">Add New {assetType}</h2>
        <button onClick={onRequestClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {/* Serial Number Input */}
          <div>
            <label htmlFor="addGenSerial" className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input type="text" id="addGenSerial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder={`e.g., ${assetType}-SN1239`} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          {/* Model Input */}
          <div>
            <label htmlFor="addGenModel" className="block text-sm font-medium text-gray-700">Model</label>
            <input type="text" id="addGenModel" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g., ModelXYZ" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          {/* Location Input */}
          <div>
            <label htmlFor="addGenLocation" className="block text-sm font-medium text-gray-700">Initial Location</label>
            <input type="text" id="addGenLocation" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Warehouse A" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex justify-end space-x-3 border-t bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onRequestClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {isLoading ? 'Adding...' : `Add ${assetType}`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGenericAssetModal;