// src/components/PlannerDashboard.js
import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import { UserCircleIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import AssignNetworkModal from './AssignNetworkModal';

const PlannerDashboard = () => {
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. Add state for the modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // --- 3. Handlers to open/close the modal ---
  const handleAssignClick = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    // Optionally, refetch the list
    // fetchPendingCustomers();
  };

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      setIsLoading(true);
      try {
        // Call your new endpoint
        const response = await apiClient.get('/customer/by-status?status=PENDING');
        setPendingCustomers(response.data);
      } catch (error) {
        toast.error("Could not fetch pending customers.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCustomers();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Pending Customer Assignments
      </h2>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            <li className="p-4 text-center text-gray-500">Loading...</li>
          ) : pendingCustomers.length > 0 ? (
            pendingCustomers.map((customer) => (
              <li 
                key={customer.id} 
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                {/* Customer Info */}
                <div className="flex items-center space-x-4">
                  <UserCircleIcon className="h-10 w-10 text-gray-300" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">
                      {customer.address}, {customer.neighborhood}
                    </p>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{customer.plan}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      Pending Assignment
                    </span>
                  </div>
                  <button onClick={() => handleAssignClick(customer)}
                    className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md text-sm hover:bg-blue-700"
                    title="Assign Network"
                  >
                    <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                    Assign
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">
              No pending customers.
            </li>
          )}
        </ul>
      </div>
      {/* --- 5. Render the modal --- */}
      {isModalOpen && (
        <AssignNetworkModal
          isOpen={isModalOpen}
          onRequestClose={handleModalClose}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
};

export default PlannerDashboard;