// src/components/UserProfile.js
import React from 'react';

const UserProfile = ({ user }) => {
  // Get the first initial from the first name
  const initial = user.firstName ? user.firstName.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex items-center space-x-3">
      {/* Profile Circle with Initial */}
      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
        {initial}
      </div>
      
      {/* Username */}
      <span className="text-gray-700 font-medium hidden sm:block">
        {user.username}
      </span>
    </div>
  );
};

export default UserProfile;