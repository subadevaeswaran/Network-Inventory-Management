import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import { Listbox } from '@headlessui/react';
import { XMarkIcon, ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';

Modal.setAppElement('#root');

const AssignNetworkModal = ({ isOpen, onRequestClose, customer }) => {
  // Lists for dropdowns
  const [fdhList, setFdhList] = useState([]);
  const [splitterList, setSplitterList] = useState([]);
  const [neighborhoodList, setNeighborhoodList] = useState([]);
  const [fiberLength, setFiberLength] = useState('');
  const [technicianList, setTechnicianList] = useState([]);
  // REMOVED: ontList, routerList states

  // Selected values
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedFdh, setSelectedFdh] = useState(null);
  const [selectedSplitter, setSelectedSplitter] = useState(null);
  const [selectedPort, setSelectedPort] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState(null);5
  // REMOVED: selectedOnt, selectedRouter states

  const [isLoading, setIsLoading] = useState(false);
useEffect(() => {
    if (isOpen) {
      const fetchNeighborhoods = async () => {
        try {
          // Use the existing endpoint that gets all distinct regions
          const response = await apiClient.get('/fdh/regions');
          setNeighborhoodList(response.data);
          // Clear dependent selections
          setSelectedNeighborhood('');
          setFdhList([]);
          setSelectedFdh(null);
          setSplitterList([]);
          setSelectedSplitter(null);
          setSelectedPort('');
        } catch (error) { toast.error("Failed to load neighborhoods."); }
      };
      fetchNeighborhoods();
    }
  }, [isOpen]);
  // --- 2. Fetch FDHs when Neighborhood is selected ---
  useEffect(() => {
    if (selectedNeighborhood) {
      const fetchFdhs = async () => {
        try {
          // Call the NEW endpoint
          const response = await apiClient.get(`/fdh/by-region?region=${selectedNeighborhood}`);
          setFdhList(response.data);
          // Clear dependent selections
          setSelectedFdh(null);
          setSplitterList([]);
          setSelectedSplitter(null);
          setSelectedPort('');
        } catch (error) { toast.error("Failed to load FDHs for this neighborhood."); }
      };
      fetchFdhs();
    } else {
        setFdhList([]); // Clear FDHs if no neighborhood selected
    }
  }, [selectedNeighborhood]);

  // --- 2. Fetch Splitters (No Change) ---
  useEffect(() => {
    if (selectedFdh) {
      const fetchSplitters = async () => {
        try {
          const response = await apiClient.get(`/splitters/by-fdh?fdhId=${selectedFdh.id}`);
          setSplitterList(response.data);
           // Clear dependent selections when splitters reload
          setSelectedSplitter(null);
          setSelectedPort('');
        } catch (error) { toast.error("Failed to load splitters."); }
      };
      fetchSplitters();
    } else {
        setSplitterList([]); // Clear splitters if no FDH is selected
    }
  }, [selectedFdh]);

  useEffect(() => {
    // Fetch only when modal opens AND customer data (with city) is available
    if (isOpen && customer?.city) {
      const fetchTechnicians = async () => {
        try {
          // Pass the customer's city as the region parameter
          const response = await apiClient.get(`/technicians?region=${customer.city}`);
          setTechnicianList(response.data);
          // Clear selection when list reloads
          setSelectedTechnician(null);
        } catch (error) { toast.error("Failed to load technicians for this city."); console.error(error);}
      };
      fetchTechnicians();
    } else {
       // Clear list if modal closed or customer city is missing
      setTechnicianList([]);
      setSelectedTechnician(null);
    }
  }, [isOpen, customer]);

  // REMOVED: useEffect for fetching assets (ONTs/Routers)

  const handleSubmit = async () => {
    setIsLoading(true);
    const assignmentData = {
        customerId: customer?.id,
        // fdhId: selectedFdh?.id, // Send FDH ID
        splitterId: selectedSplitter?.id,
        port: parseInt(selectedPort, 10), // Ensure port is a number
        // The neighborhood comes *from* the selected FDH
        neighborhood: selectedNeighborhood,
        fiberLengthMeters: parseFloat(fiberLength),
        technicianId: selectedTechnician?.id
    };
    try {
      // **Call the backend endpoint**
      await apiClient.post('/assignments', assignmentData);
      toast.success("Network assigned successfully!");
      onRequestClose(); // Close modal on success

    }catch (error) {
      // **Handle errors**
      const errorMsg = error.response?.data?.message || "Failed to assign network.";
      toast.error(errorMsg);
      console.error("Assignment failed:", error);
    }
    // Placeholder - The backend call will need to be updated later
    // to only send customerId, splitterId, and port.
    console.log("Submitting Assignment:", {
        customerId: customer?.id,
        splitterId: selectedSplitter?.id,
        port: selectedPort
    });
    
    setIsLoading(false);
    // onRequestClose(); // Keep modal open for now until backend is ready
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
      overlayClassName="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Assign Network Path for {customer?.name}</h2>
        <button onClick={onRequestClose} className="p-1 rounded-full hover:bg-gray-200">
             <XMarkIcon className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Scrollable Form */}
      <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
       {/* 1. Neighborhood Select */}
        <CustomSelect // Use string version for simple list
          label="1. Select Neighborhood"
          data={neighborhoodList}
          selected={selectedNeighborhood}
          onChange={setSelectedNeighborhood}
          // displayKey is not needed for simple string array
        />
       {/* 2. FDH Select (Filtered by Neighborhood) */}
        <CustomSelect
          label="2. Select FDH"
          data={fdhList}
          selected={selectedFdh}
          onChange={setSelectedFdh}
          displayKey="name" // Show FDH name
          disabled={!selectedNeighborhood || neighborhoodList.length === 0}
        />

        {/* 3. Splitter Select (Filtered by FDH) */}
        <CustomSelect
          label="3. Select Splitter"
          data={splitterList}
          selected={selectedSplitter}
          onChange={setSelectedSplitter}
          displayKey="id" // Or 'model'
          disabled={!selectedFdh || fdhList.length === 0}
        />

       {/* 4. Port Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">4. Assign Port (1-{selectedSplitter?.portCapacity || '?'})</label>
          <input
            type="number"
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
            min="1"
            max={selectedSplitter?.portCapacity}
            disabled={!selectedSplitter}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="Enter port number"
          />
        </div>
        <div>
          <label htmlFor="fiberLength" className="block text-sm font-medium text-gray-700">5. Fiber Drop Length (meters)</label>
          <input
            type="number"
            id="fiberLength"
            step="0.1" // Allow decimal input
            value={fiberLength}
            onChange={(e) => setFiberLength(e.target.value)}
            required // Make it required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="e.g., 50.5"
          />
        </div>

        {/* --- 6. Technician Select (Now Filtered) --- */}
        {/* --- 6. Technician Select (Now Filtered by Customer City) --- */}
        <CustomSelect
            label="6. Assign Technician"
            data={technicianList}
            selected={selectedTechnician}
            onChange={setSelectedTechnician}
            displayKey="name" // Display technician's name
            // Disable if the list is empty (still loading or no techs in city)
            disabled={technicianList.length === 0}
        />
     
        {/* REMOVED: ONT Select */}
        {/* REMOVED: Router Select */}
      </div>

      {/* Footer */}
      <div className="p-6 flex justify-end space-x-3 border-t">
        <button
          type="button" // Important for forms
          onClick={onRequestClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="button" // Important for forms
          onClick={handleSubmit} // Trigger submit manually
          // Update disabled condition
          disabled={!selectedSplitter || !selectedPort || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Assigning...' : 'Confirm Assignment'}
        </button>
      </div>
    </Modal>
  );
};

// --- Helper Dropdown Component (No changes needed) ---
function CustomSelect({ label, data = [], selected, onChange, displayKey, disabled = false }) {
    // Determine if data is an array of objects based on displayKey presence and first item type
    const isObjectArray = displayKey && data.length > 0 && typeof data[0] === 'object' && data[0] !== null;

    // Determine the text to display in the main button area
    let buttonDisplayValue = 'Select...';
    if (selected) {
        buttonDisplayValue = isObjectArray ? selected?.[displayKey] : selected;
    }
    // Handle cases where the selected value might not have the displayKey (e.g., during loading)
    if (isObjectArray && selected && !selected?.[displayKey]) {
        buttonDisplayValue = 'Loading...'; // Or keep 'Select...'
    }


    return (
      <Listbox value={selected} onChange={onChange} disabled={disabled}>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative mt-1">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
            }`}
          >
            <span className="block truncate">{buttonDisplayValue}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
            {/* Check data is an array before mapping */}
            {Array.isArray(data) && data.map((item, index) => {
                // Determine the unique key for the option
                const optionKey = isObjectArray ? item?.id ?? `item-${index}` : `item-${index}`;
                // Determine the text to display within the option
                const optionDisplayValue = isObjectArray ? item?.[displayKey] : item;

                // Basic check for null/undefined before rendering
                if (item === null || item === undefined) return null;

                return (
                  <Listbox.Option
                    key={optionKey}
                    value={item}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected: isSelected }) => ( // Renamed 'selected' prop variable
                      <>
                        <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                          {/* Display the determined text */}
                          {optionDisplayValue ?? ''}
                        </span>
                        {isSelected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <CheckIcon className="h-5 w-5" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                );
            })}
          </Listbox.Options>
        </div>
      </Listbox>
    );
  }

export default AssignNetworkModal;