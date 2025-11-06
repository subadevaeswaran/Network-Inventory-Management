// src/components/SelectAssetTypeModal.jsx
import React, { useState } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';

// Define asset types again here or import from a shared constants file
const assetTypes = ['ONT', 'ROUTER', 'SPLITTER', 'FDH', 'SWITCH', 'FIBERROLL'];

Modal.setAppElement('#root');

const SelectAssetTypeModal = ({ isOpen, onRequestClose, onTypeSelected }) => {
  const [selectedType, setSelectedType] = useState(assetTypes[0]); // Default to ONT

  const handleNext = () => {
    onTypeSelected(selectedType); // Pass the selected type back to parent
    // onRequestClose(); // Parent will close this and open the next modal
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Select Asset Type"
      className="relative z-50 w-full max-w-sm bg-white rounded-lg shadow-xl overflow-hidden" // Smaller modal
      overlayClassName="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Select Asset Type</h2>
        <button onClick={onRequestClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div>
          <label htmlFor="selectAssetType" className="block text-sm font-medium text-gray-700">
            Choose the type of asset to add:
          </label>
          <select
            id="selectAssetType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {assetTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-end space-x-3 border-t bg-gray-50">
        <button
          type="button"
          onClick={onRequestClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Next
        </button>
      </div>
    </Modal>
  );
};

export default SelectAssetTypeModal;