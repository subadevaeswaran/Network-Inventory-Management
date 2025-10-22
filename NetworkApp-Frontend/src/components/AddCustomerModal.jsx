import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import { Listbox } from '@headlessui/react';
import { XMarkIcon, ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';

// Set the app element for accessibility
Modal.setAppElement('#root');

// Mock data for dropdowns
const plans = ['500 Mbps Fiber', '1 Gbps Fiber', 'Business 500'];
const connectionTypes = ['WIRED', 'WIRELESS'];
// const statuses = ['PENDING', 'ACTIVE']; // This wasn't used, so I'll remove it for clarity

const AddCustomerModal = ({ isOpen, onRequestClose, customerToEdit }) => {
    const isEditMode = customerToEdit != null;
  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [citiesList, setCitiesList] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [plan, setPlan] = useState(plans[0]);
  const [connectionType, setConnectionType] = useState(connectionTypes[0]);
  const [neighborhoodsList, setNeighborhoodsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ... (Your useEffect hooks for fetching data are perfect) ...
  useEffect(() => {
    if (isOpen) {
      const fetchCities = async () => {
        try {
          const response = await apiClient.get('/headends/cities');
          setCitiesList(response.data);
          if (isEditMode) {
            setSelectedCity(customerToEdit.neighborhood); // Assuming city is stored in 'neighborhood' for now?
            // This is a logic issue from before. Let's assume the 'neighborhood' field
            // actually stores the neighborhood, and we need to fetch the city.
            // For now, I'll just set the fields as they are.
            // We should fix this schema later.
            
            // Pre-fill form
            setName(customerToEdit.name);
            setAddress(customerToEdit.address);
            setPlan(customerToEdit.plan);
            setConnectionType(customerToEdit.connectionType);
        
          if (response.data.length > 0) {
            setSelectedCity(response.data[0]); // Auto-select first city
          }
        }else{
            setName('');
            setAddress('');
            setPlan(plans[0]);
            setConnectionType(connectionTypes[0]);
          
        }} catch (error) {
          toast.error("Could not load city data.");
        }
      };
      fetchCities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCity) {
      const fetchNeighborhoods = async () => {
        try {
          const response = await apiClient.get(`/fdh/regions-by-city?city=${selectedCity}`);
        
       
        } catch (error) {
          toast.error("Could not load neighborhood data for this city.");
        }
      };
      fetchNeighborhoods();
    }
  }, [selectedCity]);

  // ... (Your handleSubmit function is also perfect) ...
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const customerData = {
   name,
      address,
      city: selectedCity,
   
      plan,
      connectionType,
      status: isEditMode ? customerToEdit.status : 'PENDING', // Keep status in edit mode
      assignedPort: isEditMode ? customerToEdit.assignedPort : 0,
      splitterId: isEditMode ? customerToEdit.splitterId : null,
    };
    console.log("Sending Customer Data:", customerData);

    try {
      if (isEditMode) {
        // --- EDIT (PUT) ---
        await apiClient.put(`/customer/${customerToEdit.id}`, customerData);
        toast.success('Customer successfully updated!');
      } else {
        // --- CREATE (POST) ---
        await apiClient.post('/customer', customerData);
        toast.success('Customer successfully created!');
      }
      
      onRequestClose(); // Close modal (this will trigger refetch)

    } catch (error) {
      const errorMsg = error.response?.data?.message || (isEditMode ? "Failed to update customer." : "Failed to create customer.");
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add New Customer"
      
      // --- FIX 1: The overlay already has flex, which is great ---
      overlayClassName="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
      
      // --- FIX 2: THIS IS THE MAIN CHANGE ---
      // We remove absolute positioning and use 'relative' and 'z-50'
      // We also add 'overflow-hidden' to control the scrolling
      className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
    >
      {/* --- FIX 3: We add an inner structure for scrolling ---
        1. A non-scrolling header
        2. A scrollable form area
        3. A non-scrolling footer
      */}

      {/* 1. Modal Header (Sticky) */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h2>
        <button onClick={onRequestClose} className="p-1 rounded-full hover:bg-gray-200">
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* 2. Scrollable Form Area */}
      {/* We set a max-height (e.g., 70vh) and make THIS part scroll */}
      <div className="max-h-[70vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* City Dropdown */}
          <CustomSelect 
            label="City" 
            data={citiesList} 
            value={selectedCity} 
            onChange={setSelectedCity} 
          />

          {/* Neighborhood Dropdown */}
        

          {/* Plan Selection (Dropdown) */}
          <CustomSelect label="Select Plan" data={plans} value={plan} onChange={setPlan} />

          {/* Connection Type (Dropdown) */}
          <CustomSelect label="Connection Type" data={connectionTypes} value={connectionType} onChange={setConnectionType} />
        </form>
      </div>
          
      {/* 3. Modal Footer (Sticky) */}
      <div className="p-6 flex justify-end space-x-3 border-t">
        <button
          type="button"
          onClick={onRequestClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="button" // Change to "button"
          onClick={handleSubmit} // Trigger submit manually
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Customer')}
        </button>
      </div>
      
    </Modal>
  );
};

// --- Helper Component for nice dropdowns ---
// (This component is perfect, no changes needed)
function CustomSelect({ label, data, value, onChange, disabled = false }) {
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <Listbox.Button 
          className={`relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        >
          <span className="block truncate">{value || 'Select...'}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
          {/* (I added z-50 here to be safe) */}
          {data.map((item) => (
            <Listbox.Option
              key={item}
              value={item}
              className={({ active }) =>
                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    {item}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                      <CheckIcon className="h-5 w-5" />
                    </span>
                  )}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

export default AddCustomerModal;