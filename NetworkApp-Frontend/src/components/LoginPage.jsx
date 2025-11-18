import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserIcon, LockClosedIcon, ChevronDownIcon, SignalIcon } from '@heroicons/react/24/solid';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginPage = ({ onLogin, roles, preselectedRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(preselectedRole || (roles ? roles[0] : ''));
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (preselectedRole) setSelectedRole(preselectedRole);
  }, [preselectedRole, roles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const loginData = { username, password };

    try {
      const response = await apiClient.post('/api/v1/auth/signin', loginData);
      const { accessToken, id, username: backendUsername, role: backendRole } = response.data;

      localStorage.setItem('token', accessToken);

      const user = { id, username: backendUsername, role: backendRole };
      toast.success(`Welcome, ${user.username}!`);
      onLogin(user);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) toast.error(data.message || "Incorrect username or password");
        else if (status === 404) toast.error(data.message || "Login endpoint not found.");
        else toast.error(data.message || "An unknown server error occurred.");
      } else if (error.request) toast.error("Login service is unavailable. Please try again later.");
      else toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-3xl shadow-lg border border-gray-100"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#f1f5f9] rounded-2xl">
              <SignalIcon className="w-10 h-10 text-[#2563eb]" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-[#0f172a] tracking-tight">NetworkApp</h1>
          <p className="mt-2 text-[#64748b]">Sign in to access your dashboard</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Username */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label htmlFor="username" className="block text-sm font-medium text-[#334155]">Username</label>
            <div className="relative mt-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="w-5 h-5 text-[#94a3b8]" />
              </span>
              <input
                id="username"
                type="text"
                required
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl shadow-sm placeholder-[#94a3b8] text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-all"
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-[#334155]">Password</label>
            <div className="relative mt-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon className="w-5 h-5 text-[#94a3b8]" />
              </span>
              <input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl shadow-sm placeholder-[#94a3b8] text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-all"
              />
            </div>
          </motion.div>

          {/* Role */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="role" className="block text-sm font-medium text-[#334155]">Role</label>
            <div className="relative mt-2">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDownIcon className="w-5 h-5 text-[#94a3b8]" />
              </span>
              <select
                id="role"
                disabled
                value={selectedRole}
                className="w-full py-3 px-3 bg-[#f8fafc] border border-gray-200 rounded-xl shadow-sm text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] appearance-none transition-all"
              >
                {roles && roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 font-semibold text-white rounded-xl shadow-md bg-[#2563eb] hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 focus:ring-offset-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-[#64748b]"
        >
          &copy; 2025 NetworkApp. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
