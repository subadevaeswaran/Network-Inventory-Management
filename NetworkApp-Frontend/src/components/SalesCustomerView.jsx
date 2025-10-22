// src/components/SalesCustomerView.js
import React, { useState, useEffect } from 'react';
import AddCustomerModal from './AddCustomerModal';
import { PlusIcon, UserCircleIcon, PencilIcon , MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';


// Mock data - in a real app, this would come from:
// const [customers, setCustomers] = useState([]);
// useEffect(() => {
//   fetch('/customer') // Your API endpoint
//     .then(res => res.json())
//     .then(data => setCustomers(data));
// }, []);
// const mockCustomers = [
//   { id: 1, name: 'John Doe', address: '123 Main St', plan: '500 Mbps Fiber', status: 'PENDING' },
//   { id: 2, name: 'Jane Smith', address: '456 Oak Ave', plan: '1 Gbps Fiber', status: 'ACTIVE' },
//   { id: 3, name: 'Acme Corp', address: '789 Business Pl', plan: 'Business 500', status: 'ACTIVE' },
// ];

const SalesCustomerView = () => {
    const [customers, setCustomers] = useState([]); // Start with empty array
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    try {
      const response = await apiClient.get('/customer');
      setCustomers(response.data);
    } catch (error) {
      toast.error("Could not fetch customers.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCustomerAdded = (newCustomer) => {
    setCustomers([newCustomer, ...customers]);
  };

  const handleAddCustomerClick = () => {
    setCustomerToEdit(null); // Ensure we're in "create" mode
    setIsModalOpen(true);
  };

  // --- FIX 3: Create handler for opening in "Edit" mode ---
  const handleEditCustomerClick = (customer) => {
    setCustomerToEdit(customer); // Set the customer to edit
    setIsModalOpen(true);
  };

  // --- FIX 4: Create a callback for when the modal is done ---
  // This will refetch the list to show updated data
  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchCustomers(); // Refetch the list on close
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          My Customers
        </h2>
        <button
          onClick={handleAddCustomerClick} // <-- 7. Open modal on click
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Search Bar (from previous step) */}
      <div className="mb-4">
        <label htmlFor="search" className="sr-only">Search customers</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

     {/* Customer List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {/* Map the 'filteredCustomers' list */}
          {filteredCustomers.map((customer) => (
            <li key={customer.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <UserCircleIcon className="h-10 w-10 text-gray-300" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4"> {/* Added flex here */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{customer.plan}</p>
                  {customer.status === 'ACTIVE' ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => handleEditCustomerClick(customer)} 
                  className="p-2 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600"
                  title="Edit Customer"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 8. Render the modal */}
      <AddCustomerModal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose} // Use the new close handler
        customerToEdit={customerToEdit}
      />
    </div>
  );
};

export default SalesCustomerView;