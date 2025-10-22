import React, { useState, useEffect } from 'react'; // Make sure useEffect is imported
import { toast } from 'react-toastify';
import { UserIcon, LockClosedIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import apiClient from '../api/apiClient';

const LoginPage = ({ onLogin, roles, preselectedRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(preselectedRole || (roles ? roles[0] : ''));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preselectedRole) {
      setSelectedRole(preselectedRole);
    }
  }, [preselectedRole, roles]); // Add roles as a dependency

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const loginData = {
      username: username,
      password: password,
      role: selectedRole,
    };
    
    console.log("Sending to backend:", loginData); // Good for debugging

    try {
      const response = await apiClient.post('/users/login', loginData);

      // --- SUCCESS ---
      // axios puts data in response.data
      const data = response.data; 
      toast.success(`Welcome, ${data.username}!`);
      onLogin(data); // Pass the user data up to App.js

    } catch (error) {
      // --- Error Handling ---
      if (error.response) {
        // Server responded with a non-2xx status
        const { status, data } = error.response;
        
        if (status === 404) {
          toast.error(data.message || "No user with this name");
        } 
        
        // VVVV --- FIX 1: THE TYPO IS REMOVED HERE --- VVVV
        else if (status === 401) { 
          toast.error(data.message || "Incorrect password or role mismatch");
        } 
        
        else {
          toast.error(data.message || "An unknown server error occurred.");
        }
      } else if (error.request) {
        // Network error
        toast.error("Login service is unavailable. Please try again later.");
      } else {
        // Other JS error
        toast.error("An unexpected error occurred.");
      }
    } finally {
      // This will run after try OR catch
      setIsLoading(false);
    }
    
    // VVVV --- FIX 2: THIS LINE WAS THE LOGIC ERROR --- VVVV
    // onLogin({ username: username, firstName: username, role: selectedRole }); // <-- REMOVED
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-xl">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            NetworkApp
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Username Input */}
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="w-5 h-5 text-gray-400" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label 
              htmlFor="role" 
              className="block text-sm font-medium text-gray-700"
            >
              Select your Role
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </span>
              <select
                id="role"
                name="role"
                required
                className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles && roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-white font-medium rounded-md shadow-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;