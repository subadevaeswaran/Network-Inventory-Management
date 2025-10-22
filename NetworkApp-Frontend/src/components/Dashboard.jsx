// src/components/Dashboard.js
import React from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

// Accept the user's role as a prop
const Dashboard = ({ currentUserRole }) => {
  
  // Decide if the button should be shown
  const canAddCustomer = 
    currentUserRole === 'SALES_AGENT' || currentUserRole === 'PLANNER';

  return (
    <div>
      {/* HEADER: Title and Add Customer Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Welcome to your Dashboard
        </h2>
        
        {/* Conditionally render the button */}
        {canAddCustomer && (
          <button
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        )}
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ... (Stat cards remain the same) ... */}
      </div>
    </div>
  );
};

export default Dashboard;