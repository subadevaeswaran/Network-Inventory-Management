import React from 'react';
import {
  UsersIcon,
  ChartPieIcon,
  CogIcon,
  GlobeAltIcon,
  ArchiveBoxIcon, // For Inventory
  TicketIcon,     // For Tasks
  ClockIcon, // <-- New Icon for In-Progress
  CheckCircleIcon, // <-- New Icon for Completed
} from '@heroicons/react/24/outline';

// Helper component for a navigation link
const NavLink = ({ href, icon: Icon, label, isActive = false , onClick}) => (
  <a
    href={href}
    onClick={onClick}
    className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
      isActive
        ? 'text-white bg-blue-600' // Active link
        : 'text-gray-200 hover:bg-slate-700' // Inactive link
    }`}
  >
    <Icon className="h-6 w-6 mr-3" />
    {label}
  </a>
);

// --- 1. Sidebar for SALES_AGENT ---
// (Simple: just customers)
const SalesAgentSidebar = () => (
  <nav className="flex-1 mt-6 px-4 space-y-1">
    <NavLink href="#customers" icon={UsersIcon} label="My Customers" isActive={true} />
  </nav>
);

// --- 2. Sidebar for PLANNER (Reconstructed) ---
// (Powerful: controls the main workflow)
const PlannerSidebar = () => (
  <nav className="flex-1 mt-6 px-4 space-y-1">
    <NavLink href="#dashboard" icon={ChartPieIcon} label="Task" isActive={true} />
    <NavLink href="#topology" icon={GlobeAltIcon} label="Network Topology" />
    <NavLink href="#inventory" icon={ArchiveBoxIcon} label="Asset Inventory" />
    <NavLink href="#tasks" icon={TicketIcon} label="Deployment Tasks" />
    <NavLink href="#customers" icon={UsersIcon} label="All Customers" />
  </nav>
);

// --- 3. Sidebar for TECHNICIAN ---
// (Based on Journey 1: "Land on 'My Tasks' dashboard")
const TechnicianSidebar = ({ activeView, setActiveView }) => ( // Accept props
  <nav className="flex-1 mt-6 px-4 space-y-1">
    <NavLink
      href="#tasks/scheduled"
      icon={TicketIcon}
      label="Scheduled Tasks"
      isActive={activeView === 'SCHEDULED'}
      onClick={(e) => { e.preventDefault(); setActiveView('SCHEDULED'); }} // Set active view
    />
    <NavLink
      href="#tasks/inprogress"
      icon={ClockIcon}
      label="In-Progress Tasks"
      isActive={activeView === 'INPROGRESS'}
      onClick={(e) => { e.preventDefault(); setActiveView('INPROGRESS'); }} // Set active view
    />
    <NavLink
      href="#tasks/completed"
      icon={CheckCircleIcon}
      label="Completed Tasks"
      isActive={activeView === 'COMPLETED'}
      onClick={(e) => { e.preventDefault(); setActiveView('COMPLETED'); }} // Set active view
    />
    {/* Optional: Add Inventory Lookup later */}
    {/* <NavLink href="#inventory" icon={ArchiveBoxIcon} label="Look Up Asset" /> */}
  </nav>
);

// --- 4. Sidebar for ADMIN ---
// (Has access to everything, plus user/log management later)
const AdminSidebar = () => (
  <nav className="flex-1 mt-6 px-4 space-y-1">
    <NavLink href="#dashboard" icon={ChartPieIcon} label="Main Dashboard" isActive={true} />
    <NavLink href="#topology" icon={GlobeAltIcon} label="Network Topology" />
    <NavLink href="#inventory" icon={ArchiveBoxIcon} label="Asset Inventory" />
    <NavLink href="#tasks" icon={TicketIcon} label="All Tasks" />
    <NavLink href="#customers" icon={UsersIcon} label="All Customers" />
    {/* We will add "User Management" and "Audit Logs" here later */}
  </nav>
);


// --- Main Sidebar Component (Handles Role Switching) ---
const Sidebar = ({ currentUserRole, activeView, setActiveView }) => {

  const renderNavLinks = () => {
    switch (currentUserRole) {
      case 'SALES_AGENT':
        return <SalesAgentSidebar />;
      case 'PLANNER':
        // Pass activeView/setActiveView if Planner needs similar functionality
        return <PlannerSidebar /* activeView={activeView} setActiveView={setActiveView} */ />;
      case 'TECHNICIAN':
        // Pass the state and setter down
        return <TechnicianSidebar activeView={activeView} setActiveView={setActiveView} />;
      case 'ADMIN':
        // Pass activeView/setActiveView if Admin needs similar functionality
        return <AdminSidebar /* activeView={activeView} setActiveView={setActiveView} */ />;
      default:
        return <nav className="flex-1 mt-6 px-4"><p>No links configured.</p></nav>;
    }
  };

  return (
    <div className="w-64 bg-slate-800 text-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center justify-center text-2xl font-bold text-white shadow-md">
        NetworkApp
      </div>

      {/* Conditional Navigation */}
      {renderNavLinks()}

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-700">
        <NavLink href="#settings" icon={CogIcon} label="Settings" />
      </div>
    </div>
  );
};

export default Sidebar;