import React from 'react';
import {
  UsersIcon,
  ChartPieIcon,
  CogIcon,
  GlobeAltIcon,
  ArchiveBoxIcon, // For Inventory
  TicketIcon,     // For Tasks
  ClockIcon, // <-- New Icon for In-Progress
  CheckCircleIcon,
  BookOpenIcon,
   // <-- New Icon for Completed,
} from '@heroicons/react/24/outline';
import { Topology } from './Topology';

import { NavLink as RouterNavLink } from 'react-router-dom';

// Helper component for a navigation link
const NavLink = ({ to, icon: Icon, label, end = false }) => (
  <RouterNavLink
    to={to}
    end={end} // 'end' prop ensures '/' isn't "active" for '/topology'
    // 3. This 'className' function is how NavLink handles active state
    className={({ isActive }) =>
      `flex items-center px-3 py-2 text-base font-medium rounded-md ${
        isActive
          ? 'text-white bg-blue-600' // Active link
          : 'text-gray-200 hover:bg-slate-700' // Inactive link
      }`
    }
  >
    <Icon className="h-6 w-6 mr-3" />
    {label}
  </RouterNavLink>
);

// --- 1. SalesAgentSidebar (No changes needed, but 'to' is better) ---
const SalesAgentSidebar = () => (
  <nav className="flex-1 mt-6 px-4 space-y-1">
    {/* Use 'to="/"' and 'end' for the index route */}
    <NavLink to="/" icon={UsersIcon} label="My Customers" end />
  </nav>
);

// --- 2. PlannerSidebar (Updated) ---
const PlannerSidebar = () => (
  <nav className="flex-1 mt-6 px-4 space-y-1">
    {/* Use 'to' prop, remove 'href' and 'onClick' */}
    <NavLink to="/" icon={ChartPieIcon} label="Task" end />
    <NavLink to="/topology" icon={GlobeAltIcon} label="Network Topology" />
    <NavLink to="/inventory" icon={ArchiveBoxIcon} label="Asset Inventory" />
    <NavLink to="/tasks" icon={TicketIcon} label="Deployment Tasks" />
    <NavLink to="/customers" icon={UsersIcon} label="All Customers" />
  </nav>
);

// --- 3. TechnicianSidebar (Updated) ---
// 4. It no longer needs activeView or setActiveView props
const TechnicianSidebar = () => (
  <nav className="flex-1 mt-6 px-4 space-y-1">
    <NavLink
      to="/" // This is the 'index' route
      icon={TicketIcon}
      label="Scheduled Tasks"
      end // 'end' is important here
    />
    <NavLink
      to="/inprogress" // This path matches App.jsx
      icon={ClockIcon}
      label="In-Progress Tasks"
    />
    <NavLink
      to="/completed" // This path matches App.jsx
      icon={CheckCircleIcon}
      label="Completed Tasks"
    />
    <NavLink to="/report"
    icon={CheckCircleIcon}
    label="Report Device" />
  </nav>
);

// --- 4. AdminSidebar (Updated) ---
// 5. It no longer needs activeView or setActiveView props
const AdminSidebar = () => (
  <nav className="flex-1 mt-6 px-4 space-y-1">
    <NavLink to="/" icon={ChartPieIcon} label="Main Dashboard" end />
    <NavLink to="/admin/topology" icon={GlobeAltIcon} label="Network Topology" />
    <NavLink to="/admin/inventory" icon={ArchiveBoxIcon} label="Asset Inventory" />
    <NavLink to="/admin/tasks" icon={TicketIcon} label="All Tasks" />
    <NavLink to="/admin/customers" icon={UsersIcon} label="All Customers" />
    <NavLink to="/admin/auditlogs" icon={BookOpenIcon} label="Audit Logs" />
    <NavLink to="/admin/users" icon={UsersIcon} label="User Management" />
  </nav>
);

// --- 5. SupportAgentSidebar (Updated) ---
const SupportAgentSidebar = () => (
  <nav className="flex-1 mt-6 px-4 space-y-1">
    <NavLink to="/" icon={ChartPieIcon} label="Support Tools" end />
  </nav>
);


// --- Main Sidebar Component (Handles Role Switching) ---
const Sidebar = ({ currentUserRole }) => {

  const renderNavLinks = () => {
    switch (currentUserRole) {
      case 'SALES_AGENT':
        return <SalesAgentSidebar />;
      case 'PLANNER':
        return <PlannerSidebar />;
      case 'TECHNICIAN':
        return <TechnicianSidebar />;
      case 'ADMIN':
        return <AdminSidebar />;
      case 'SUPPORTAGENT':
        return <SupportAgentSidebar />;
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
        <NavLink to="/settings" icon={CogIcon} label="Settings" />
      </div>
    </div>
  );
};

export default Sidebar;