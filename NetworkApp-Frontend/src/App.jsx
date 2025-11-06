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
import Inventory from './components/Inventory';
import { Topology } from './components/Topology';
import AuditLogView from './components/AuditLogView';
import AllTasksView from './components/AllTaskView';
import AllCustomersView from './components/AllCustomerView';
import SupportAgentView from './components/SupportAgentView';
import { useNavigate } from 'react-router-dom';
import { Route, Routes , Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import UserManagementView from './components/UserManagementView';
import ReportFaultyDevice from './components/ReportFaultyDevice';
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

// const renderDashboard = (user , technicianId , activeView , setActiveView ) => {
//   switch (user.role) {
//     case 'SALES_AGENT':
//       return <SalesCustomerView />;
//     case 'PLANNER':
//       switch (activeView) {
//           case 'PLANNER_TOPOLOGY': return <Topology />; // Placeholder
//           case 'PLANNER_INVENTORY': return <Inventory />; // Planner can view inventory
//           case 'PLANNER_TASKS': return <div>Deployment Tasks (Planner)</div>; // Placeholder
//           case 'PLANNER_CUSTOMERS': return <div>All Customers (Planner)</div>; // Placeholder
//           case 'PLANNER_DASHBOARD': // Fallback to default dashboard
//           default: return <PlannerDashboard />;
//       }
//     case 'TECHNICIAN': // Ensure this matches the role string exactly
//       return technicianId
//         ? <TechnicianDashboard technicianId={technicianId} activeView={activeView} />
//         : <div>Loading Technician data...</div>;
//     case 'SUPPORTAGENT':
//       switch(activeView) {
//         case 'SUPPORT_TOOL' : return <SupportAgentView  currentUserRole={user.role} />;
//         default: return <SupportAgentView  currentUserRole={user.role} />
//       }
      
//     case 'ADMIN':
//      switch (activeView) {
//         case 'ADMIN_TOPOLOGY': return <Topology />;// Placeholder
//         case 'ADMIN_INVENTORY': return <Inventory />; // <-- Show Inventory component
//         case 'ADMIN_TASKS': return <AllTasksView/>; // Placeholder
//         case 'ADMIN_CUSTOMERS': return <AllCustomersView />; // Placeholder
//         case 'ADMIN_AUDITLOGS':
//             return <AuditLogView />;
//         // Add User Management, Audit Logs later
//         case 'ADMIN_DASHBOARD': 
//         default: return <Dashboard currentUserRole={user.role} setActiveView={setActiveView}/>;
//       }
//     default:
//       return <Dashboard currentUserRole={user.role} setActiveView={setActiveView}/> ;
//   }
// };
// const DashboardLayout = ({ user, roles, onLogout, onRoleSwitch, technicianId, activeView, setActiveView }) => (
//   // console.log('Active View:', activeTechView),
//   <div className="flex h-screen bg-gray-100">
//     {/* Sidebar now gets the user's role to render conditionally */}
//    <Sidebar
//         roles={roles} // Pass roles if needed by Sidebar logic
//         currentUserRole={user.role}
//         activeView={activeView} // Pass state down
//         setActiveView={setActiveView} // Pass setter down
//     />
    
//     <div className="flex-1 flex flex-col">
//       <Navbar 
//         user={user} 
//         roles={roles} 
//         onLogout={onLogout} 
//         onRoleSwitch={onRoleSwitch} 
//       />
      
//       <main className="flex-1 p-6 md:p-10 overflow-y-auto">
//         {/* Conditionally render the Sales Agent's view or the main Dashboard */}
//        {renderDashboard(user, technicianId, activeView, setActiveView )}
//       </main>
      
//       <Footer />
//     </div>
//   </div>
// );

function App() {
  const [user, setUser] = useState(null);
  const [preselectedRole, setPreselectedRole] = useState(null);
  const [technicianId, setTechnicianId] = useState(null);
  // const [activeView, setActiveView] = useState('SCHEDULED'); // Default for Technician

  const roles = ['ADMIN', 'PLANNER', 'TECHNICIAN', 'SUPPORTAGENT', 'SALES_AGENT'];
  const navigate  = useNavigate();

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
    console.log(user);  
    setPreselectedRole(null);
    // Set default view based on role
   navigate('/');

    }


const handleLogout = () => {
    setUser(null); setPreselectedRole(null); setTechnicianId(null); navigate('/login');;
  };

  const handleRoleSwitch = (role) => {
    setUser(null); setPreselectedRole(role); setTechnicianId(null); navigate('/login');; // Reset view
  };

 const RoleBasedRoutes = ({user, technicianId}) => {
    switch (user.role) {
      case 'SALES_AGENT':
        return (
          <Route index element={<SalesCustomerView user={user} />} />
        );
      case 'PLANNER':
        return (
          <>
            <Route index element={<PlannerDashboard user={user} />} />
            <Route path="topology" element={<Topology user={user} />} />
            <Route path="inventory" element={<Inventory user={user} />} />
            <Route path="tasks" element={<div>Deployment Tasks (Planner)</div>} />
            <Route path="customers" element={<div>All Customers (Planner)</div>} />
          </>
        );
      case 'TECHNICIAN':
        return (
          <>
            <Route index element={<TechnicianDashboard technicianId={technicianId} activeView="SCHEDULED" user={user} />} />
            <Route path="inprogress" element={<TechnicianDashboard technicianId={technicianId} activeView="INPROGRESS" user={user} />} />
            <Route path="completed" element={<TechnicianDashboard technicianId={technicianId} activeView="COMPLETED" user={user} />} />
          <Route  path="report" element={<ReportFaultyDevice user={user}/>}/>
          </>
        );
      case 'SUPPORTAGENT':
        return (
          <Route index element={<SupportAgentView user={user} />} />
        );
      case 'ADMIN':
        // Note: Your sidebar links to /admin/topology, but your routes
        // should be relative. I've kept your absolute paths for now,
        // but it's better to make them relative (e.g., path="admin/topology")
        return (
          <>
            <Route index element={<Dashboard currentUserRole={user.role} />} />
            <Route path="admin/topology" element={<Topology user={user} />} />
            <Route path="admin/inventory" element={<Inventory user={user} />} />
            <Route path="admin/tasks" element={<AllTasksView user={user}/>} />
            <Route path="admin/customers" element={<AllCustomersView user={user} />} />
            <Route path="admin/auditlogs" element={<AuditLogView user={user} />} />
            <Route path="admin/users" element={<UserManagementView user={user} />}/>
          </>
        );
      default:
        return (
          <Route index element={<Dashboard currentUserRole={user.role} user={user} />} />
        );
    } };

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

       <Routes>
        {/* === PUBLIC ROUTE === */}
        <Route 
          path="/login" 
          element={
            !user ? (
              <LoginPage onLogin={handleLogin} roles={roles} preselectedRole={preselectedRole} />
             ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* === PROTECTED ROUTES === */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route 
            path="/" // Match all nested routes
            element={
              <DashboardLayout 
                   user={user} 
                roles={roles} 
_                 onLogout={handleLogout} 
                onRoleSwitch={handleRoleSwitch} 
               technicianId={technicianId} 
              />
            }
          >
            {/* --- THIS IS THE FIX --- */}
            {/* This line calls your RoleBasedRoutes function, which "injects"
              all the correct child routes (like Topology, Inventory, etc.)
              for the <Outlet> in DashboardLayout to find.
            */}
            {user && RoleBasedRoutes({user,technicianId})}

            {/* The "Page Not Found" route MUST be last, so it only
              renders if no other specific route is matched.
            */}
              <Route path="*" element={<div>Page Not Found</div>} />
         </Route>
          </Route>
      </Routes>
    </>
  );
}

export default App;