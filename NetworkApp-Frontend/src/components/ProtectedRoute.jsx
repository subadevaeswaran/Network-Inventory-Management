import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// It takes the 'user' object as a prop from App.jsx
const ProtectedRoute = ({ user }) => {
  if (!user) {
    // 1. If no user, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // 2. If user exists, render the child component (e.g., DashboardLayout)
  // <Outlet /> is a placeholder for the nested routes
  return <Outlet />; 
};

export default ProtectedRoute;