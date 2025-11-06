// src/components/AddSplitterModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'sonner';
import apiClient from '../api/apiClient';
import { X } from 'lucide-react';

Modal.setAppElement('#root');

// Reusable Select Component (Assuming it exists or define here)
const CustomSelect = ({ label, data = [], selected, onChange, displayKey, valueKey = 'id', disabled = false, required = false }) => {
    const displayValue = selected ? (selected[displayKey] ?? 'Select...') : 'Select...';
    return (
        <div>
            <label htmlFor={label} className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
            <select
                id={label}
                value={selected ? selected[valueKey] : ''} // Use valueKey for the option value
                onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedObj = data.find(item => String(item[valueKey]) === selectedId); // Find object by ID
                    onChange(selectedObj || null); // Pass the whole object back
                }}
                disabled={disabled || data.length === 0}
                required={required}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
                <option value="" disabled>{data.length === 0 ? 'Loading or No Options...' : 'Select...'}</option>
                {data.map((item) => (
                    <option key={item[valueKey]} value={item[valueKey]}>
                        {item[displayKey]} {/* Display text */}
                    </option>
                ))}
            </select>
        </div>
    );
};
// ----- End CustomSelect -----


const AddSplitterModal = ({ isOpen, onRequestClose, onSplitterAdded }) => {
  // Form state
  const [model, setModel] = useState('');
  const [portCapacity, setPortCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedFdh, setSelectedFdh] = useState(null); // Store the whole FDH object

  // Dropdown lists
  const [citiesList, setCitiesList] = useState([]);
  const [fdhList, setFdhList] = useState([]); // FDHs filtered by city

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCities, setIsFetchingCities] = useState(false);
  const [isFetchingFdhs, setIsFetchingFdhs] = useState(false);


  // Fetch Cities when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCities = async () => {
        setIsFetchingCities(true);
        try {
          const response = await apiClient.get('/headends/cities');
          setCitiesList(response.data);
          // Reset form
          setModel(''); setPortCapacity(''); setLocation('');
          setSelectedCity(''); setSelectedFdh(null); setFdhList([]);
        } catch (error) { toast.error("Failed to load cities."); }
        finally { setIsFetchingCities(false); }
      };
      fetchCities();
    }
  }, [isOpen]);

  // Fetch FDHs when City changes
  useEffect(() => {
    if (selectedCity) {
      const fetchFdhs = async () => {
        setIsFetchingFdhs(true);
        console.log(selectedCity);
        try {
          const response = await apiClient.get(`/fdh/by-city?city=${selectedCity}`);
          setFdhList(response.data);
          setSelectedFdh(null); // Reset FDH selection
        } catch (error) { toast.error("Failed to load FDHs for this city."); setFdhList([]); }
        finally { setIsFetchingFdhs(false); }
      };
      fetchFdhs();
    } else {
      setFdhList([]); // Clear FDH list if no city selected
      setSelectedFdh(null);
    }
  }, [selectedCity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFdh) {
        toast.warning("Please select a parent FDH.");
        return;
    }
    setIsLoading(true);
    const splitterData = {
      model,
      portCapacity: parseInt(portCapacity, 10),
      location,
      fdhId: selectedFdh.id, // Send the ID of the selected FDH
    };

    try {
      const response = await apiClient.post('/splitters', splitterData);
      toast.success('Splitter added successfully!');
      if (onSplitterAdded) {
        onSplitterAdded(response.data); // Callback
      }
      onRequestClose(); // Close modal
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add Splitter.";
      toast.error(errorMsg);
      console.error("Add Splitter error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add New Splitter"
      className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
      overlayClassName="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gray-50 rounded-t-lg">
        <h2 className="text-xl font-semibold text-gray-800">Add New Splitter</h2>
        <button onClick={onRequestClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Scrollable Form Area */}
      <form onSubmit={handleSubmit}>
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">

           {/* 1. City Select */}
           <div>
              <label htmlFor="splitterCity" className="block text-sm font-medium text-gray-700">City *</label>
              <select
                id="splitterCity"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                required
                disabled={isFetchingCities || citiesList.length === 0}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                 <option value="" disabled>{isFetchingCities ? 'Loading...' : 'Select City'}</option>
                 {citiesList.map((city) => ( <option key={city} value={city}>{city}</option> ))}
              </select>
           </div>

           {/* 2. Parent FDH Select */}
           <CustomSelect
                label="Parent FDH"
                data={fdhList}
                selected={selectedFdh}
                onChange={setSelectedFdh}
                displayKey="name" // Show FDH name
                valueKey="id"     // The value is the FDH id
                disabled={!selectedCity || isFetchingFdhs || fdhList.length === 0}
                required={true}
           />

           {/* 3. Model Input */}
           <div>
             <label htmlFor="splitterModel" className="block text-sm font-medium text-gray-700">Model *</label>
             <input type="text" id="splitterModel" value={model} onChange={(e) => setModel(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 1:8 SC/APC"/>
           </div>

           {/* 4. Port Capacity Input */}
           <div>
             <label htmlFor="splitterPorts" className="block text-sm font-medium text-gray-700">Port Capacity *</label>
             <input type="number" id="splitterPorts" value={portCapacity} onChange={(e) => setPortCapacity(e.target.value)} required min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 8, 16, 32"/>
           </div>

           {/* 5. Location Input */}
           <div>
             <label htmlFor="splitterLocation" className="block text-sm font-medium text-gray-700">Physical Location *</label>
             <input type="text" id="splitterLocation" value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Pole 205, Maple St"/>
           </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 flex justify-end space-x-3 border-t bg-gray-50 rounded-b-lg">
          <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Cancel</button>
          <button
            type="submit"
            disabled={isLoading || isFetchingCities || isFetchingFdhs}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {isLoading ? 'Adding...' : 'Add Splitter'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSplitterModal;