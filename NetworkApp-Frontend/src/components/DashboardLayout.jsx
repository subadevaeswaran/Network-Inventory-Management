// src/components/DashboardLayout.jsx (NEW FILE)
import React from 'react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom'; // 1. Import Outlet
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

// All props are passed down from App.jsx
const DashboardLayout = ({ user, roles, onLogout, onRoleSwitch, technicianId }) => {
  const [activeView, setActiveView] = useState('');
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        roles={roles}
        currentUserRole={user.role}
        activeView = {activeView}
        setActiveView = {setActiveView}
        // activeView and setActiveView are NO LONGER NEEDED
      />

      <div className="flex-1 flex flex-col">
        <Navbar
          user={user}
          roles={roles}
          onLogout={onLogout}
          onRoleSwitch={onRoleSwitch}
        />

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* 2. <Outlet /> will render the correct "page" component 
            based on the URL (e.g., <Topology />, <Inventory />, etc.)
          */}
          <Outlet context={{user ,technicianId , activeView , setActiveView }} />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;