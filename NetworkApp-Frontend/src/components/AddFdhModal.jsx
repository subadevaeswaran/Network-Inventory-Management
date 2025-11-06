import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'sonner';
import apiClient from '../api/apiClient';
import { X } from 'lucide-react'; // Use X for close icon

Modal.setAppElement('#root');

const AddFdhModal = ({ isOpen, onRequestClose, onFdhAdded }) => {
  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState(''); // Neighborhood
  const [maxPorts, setMaxPorts] = useState('');
  const [selectedHeadendId, setSelectedHeadendId] = useState('');
  const [headends, setHeadends] = useState([]); // List for dropdown
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHeadends, setIsFetchingHeadends] = useState(false);

  // Fetch Headends when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchHeadends = async () => {
        setIsFetchingHeadends(true);
        try {
          // Assuming endpoint exists in HeadendController
          const response = await apiClient.get('/headends');
          setHeadends(response.data);
          // Reset form fields
          setName('');
          setLocation('');
          setRegion('');
          setMaxPorts('');
          setSelectedHeadendId('');
        } catch (error) {
          toast.error("Failed to load Headends.");
          console.error("Fetch Headends error:", error);
          setHeadends([]); // Clear list on error
        } finally {
          setIsFetchingHeadends(false);
        }
      };
      fetchHeadends();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!selectedHeadendId) {
        toast.warning("Please select a parent Headend.");
        return;
    }
    setIsLoading(true);
    const fdhData = {
      name,
      location,
      region,
      maxPorts: parseInt(maxPorts, 10), // Ensure it's a number
      headendId: parseInt(selectedHeadendId, 10), // Ensure it's a number
    };

    try {
      const response = await apiClient.post('/fdh', fdhData);
      toast.success('FDH added successfully!');
      if (onFdhAdded) {
        onFdhAdded(response.data); // Callback for parent component
      }
      onRequestClose(); // Close modal
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add FDH.";
      toast.error(errorMsg);
      console.error("Add FDH error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add New FDH"
      className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
      overlayClassName="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-semibold text-gray-800">Add New Fiber Distribution Hub (FDH)</h2>
        <button onClick={onRequestClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Scrollable Form Area */}
      <form onSubmit={handleSubmit}>
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">

          {/* --- FIX 1: Parent Headend Select (Moved to Top) --- */}
          <div>
            <label htmlFor="fdhHeadend" className="block text-sm font-medium text-gray-700">
              Parent Headend *
            </label>
            <select
              id="fdhHeadend"
              value={selectedHeadendId} // Bind value to the ID state
              onChange={(e) => setSelectedHeadendId(e.target.value)}
              required
              disabled={isFetchingHeadends || headends.length === 0}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="" disabled>
                {isFetchingHeadends ? 'Loading Headends...' : (headends.length === 0 ? 'No Headends Found' : 'Select Headend')}
              </option>
              {headends.map((headend) => (
                // --- FIX 2: Set option value to headend.id and text content to name/city ---
                <option key={headend.id} value={headend.id}>
                  {headend.name} ({headend.city || 'N/A'})
                </option>
              ))}
            </select>
             {headends.length === 0 && !isFetchingHeadends && (
                 <p className="text-xs text-red-600 mt-1">Please add a Headend in the system first.</p>
             )}
          </div>
          {/* --------------------------------------------------- */}


          {/* Name Input */}
          <div>
            <label htmlFor="fdhName" className="block text-sm font-medium text-gray-700">FDH Name / Identifier *</label>
            <input type="text" id="fdhName" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., FDH-C1"/>
          </div>
          {/* Location Input */}
          <div>
            <label htmlFor="fdhLocation" className="block text-sm font-medium text-gray-700">Physical Location *</label>
            <input type="text" id="fdhLocation" value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Corner Main St & 3rd Ave"/>
          </div>
          {/* Region/Neighborhood Input */}
          <div>
            <label htmlFor="fdhRegion" className="block text-sm font-medium text-gray-700">Region / Neighborhood Served *</label>
            <input type="text" id="fdhRegion" value={region} onChange={(e) => setRegion(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Neighborhood C1"/>
          </div>
          {/* Max Ports Input */}
          <div>
            <label htmlFor="fdhMaxPorts" className="block text-sm font-medium text-gray-700">Maximum Port Capacity *</label>
            <input type="number" id="fdhMaxPorts" value={maxPorts} onChange={(e) => setMaxPorts(e.target.value)} required min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 64"/>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 flex justify-end space-x-3 border-t bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onRequestClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit" // Use submit type
            disabled={isLoading || isFetchingHeadends || headends.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {isLoading ? 'Adding...' : 'Add FDH'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFdhModal;