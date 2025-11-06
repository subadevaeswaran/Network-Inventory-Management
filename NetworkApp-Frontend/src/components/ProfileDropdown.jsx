// src/components/ProfileDropdown.js
import React from 'react';
import { 
  ArrowRightStartOnRectangleIcon, 
  UserCircleIcon,
  CogIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const ProfileDropdown = ({ roles, onLogout, onRoleSwitch, onClose }) => {
  
  const handleSwitch = (role) => {
    onRoleSwitch(role);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">
          Switch Role
        </h3>
        <ul className="mt-2 space-y-1">
          {roles.map((role) => (
            <li key={role}>
              <button
                onClick={() => handleSwitch(role)}
                className="w-full text-left flex justify-between items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-blue-50"
              >
                <span>{role}</span>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>


      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Logout */}
      <div className="p-2">
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;