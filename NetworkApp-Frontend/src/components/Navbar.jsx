// src/components/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import UserProfile from './UserProfile';
import ProfileDropdown from './ProfileDropdown';
import { Bars3Icon } from '@heroicons/react/24/outline';

const Navbar = ({ user, roles, onLogout, onRoleSwitch }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // To detect clicks outside

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 relative z-10">
      {/* Left side */}
      <div>
        <button className="text-gray-500 md:hidden">
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
          Dashboard
        </h1>
      </div>

      {/* Right side - User Profile & Dropdown */}
      <div className="relative" ref={dropdownRef}>
        {/* UserProfile is now a button */}
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <UserProfile user={user} />
        </button>

        {/* The Dropdown Menu */}
        {isDropdownOpen && (
          <ProfileDropdown
            roles={roles}
            onLogout={onLogout}
            onRoleSwitch={onRoleSwitch}
            onClose={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    </header>
  );
};

export default Navbar;