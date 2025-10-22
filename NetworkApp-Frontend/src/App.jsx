// src/App.js
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import SalesCustomerView from './components/SalesCustomerView'; // Import new view
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlannerDashboard from './components/PlannerDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import apiClient from './api/apiClient';

const getTechnicianIdForUser = async (userId) => {
    try {
        const response = await apiClient.get(`/technicians/by-user/${userId}`);
        return response.data.id;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error(`No technician record found for user ID: ${userId}`);
            toast.error("Technician details not found for this user account.");
        } else {
            console.error("Failed to fetch technician details:", error);
            toast.error("Error retrieving technician details.");
        }
        return null;
    }
};

const renderDashboard = (user , technicianId , activeTechView) => {
  switch (user.role) {
    case 'SALES_AGENT':
      return <SalesCustomerView />;
    case 'PLANNER':
      return <PlannerDashboard />; // <-- 2. Add case for PLANNER
    case 'TECHNICIAN': // Ensure this matches the role string exactly
      return technicianId
        ? <TechnicianDashboard technicianId={technicianId} activeView={activeTechView} />
        : <div>Loading Technician data...</div>;
    case 'ADMIN':
      return <Dashboard currentUserRole={user.role} />; // Admin gets main dashboard
    // Add other roles here later
    default:
      return <Dashboard currentUserRole={user.role} />;
  }
};
const DashboardLayout = ({ user, roles, onLogout, onRoleSwitch, technicianId, activeTechView, setActiveTechView }) => (
  console.log('Active View:', activeTechView),
  <div className="flex h-screen bg-gray-100">
    {/* Sidebar now gets the user's role to render conditionally */}
    <Sidebar
        roles={roles}
        currentUserRole={user.role}
        technicianId={technicianId}
        activeView={activeTechView}
        setActiveView={setActiveTechView}
    />
    
    <div className="flex-1 flex flex-col">
      <Navbar 
        user={user} 
        roles={roles} 
        onLogout={onLogout} 
        onRoleSwitch={onRoleSwitch} 
      />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Conditionally render the Sales Agent's view or the main Dashboard */}
       {renderDashboard(user, technicianId, activeTechView)}
      </main>
      
      <Footer />
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [preselectedRole, setPreselectedRole] = useState(null);
  const [technicianId, setTechnicianId] = useState(null);
  const [activeTechView, setActiveTechView] = useState('SCHEDULED'); // Default for Technician

  const roles = ['ADMIN', 'PLANNER', 'TECHNICIAN', 'SUPPORTAGENT', 'SALES_AGENT'];

  useEffect(() => {
    const fetchTechId = async () => {
      setTechnicianId(null); // Clear first
      if (user && user.role === 'TECHNICIAN' && user.id) {
        const id = await getTechnicianIdForUser(user.id);
        if (id) { setTechnicianId(id); }
      }
    };
    fetchTechId();
  }, [user]);


 const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setPreselectedRole(null);
    if (loggedInUser.role === 'TECHNICIAN') { setActiveTechView('SCHEDULED'); }
  };

 const handleLogout = () => {
    setUser(null);
    setPreselectedRole(null);
    setTechnicianId(null);
    setActiveTechView('SCHEDULED');
  };

  const handleRoleSwitch = (role) => {
    setUser(null);
    setPreselectedRole(role);
    setTechnicianId(null);
    setActiveTechView('SCHEDULED');
  };

  return (
    <>
    {/* --- Add this component --- */}
      {/* This renders the toast popups */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
   {!user ? (
        <LoginPage onLogin={handleLogin} roles={roles} preselectedRole={preselectedRole} />
      ) : (
        // Pass technicianId, activeTechView, setActiveTechView down
        <DashboardLayout
          user={user}
          roles={roles}
          onLogout={handleLogout}
          onRoleSwitch={handleRoleSwitch}
          technicianId={technicianId}
          activeTechView={activeTechView}
          setActiveTechView={setActiveTechView}
        />
      )}
    </>
  );
}

export default App;