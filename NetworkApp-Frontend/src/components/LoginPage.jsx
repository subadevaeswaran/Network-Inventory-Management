import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserIcon, LockClosedIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const LoginPage = ({ onLogin, roles, preselectedRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // This role selection is for a *pre-selected* role from App.jsx,
  // but we will NOT send it during login.
  const [selectedRole, setSelectedRole] = useState(preselectedRole || (roles ? roles[0] : ''));
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Get the navigate function from the router
  const navigate = useNavigate();

  useEffect(() => {
    if (preselectedRole) {
      setSelectedRole(preselectedRole);
    }
  }, [preselectedRole, roles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // --- CHANGE 1: THE LOGIN DATA ---
    // Your new backend ONLY wants username and password.
    // It is more secure because the *server* determines the role.
    const loginData = {
      username: username,
      password: password,
    };
    
    // This is your old data, which we are no longer using:
    // const oldLoginData = {
    //   username: username,
    //   password: password,
    //   role: selectedRole,
    // };
    
    console.log("Sending to backend:", loginData);

    try {
      // --- CHANGE 2: THE ENDPOINT URL ---
      // This now matches your AuthController's @RequestMapping
      const response = await apiClient.post('/api/v1/auth/signin', loginData);

      // --- CHANGE 3: THE SUCCESS HANDLER ---
      // The response.data is your 'JwtResponse' DTO
      const { accessToken, id, username: backendUsername, role: backendRole } = response.data;

      console.log(accessToken);
      console.log(backendRole);
      
      // 1. Store the token in localStorage
      // This is the most important step.
      // Your apiClient (in the next step) will read this token.
      localStorage.setItem('token', accessToken);
      
      // 2. Create the user object for your App.jsx state
      const user = {
        id: id,
        username: backendUsername,
        role: backendRole
      };
      
      toast.success(`Welcome, ${user.username}!`);
      
      // 3. Call the onLogin prop (which is now in App.jsx)
      // This will set the user state in App.jsx and trigger
      // the ProtectedRoute to render the dashboard.
      onLogin(user);
      
      // 4. Navigate to the main page (handled by App.jsx 'onLogin')
      // navigate('/'); // This is handled by onLogin in App.jsx now

    } catch (error) {
      // --- Error Handling (This is mostly the same) ---
      if (error.response) {
        const { status, data } = error.response;
        
        // 401 is the standard for "Unauthorized" (bad username/password)
        if (status === 401) { 
          toast.error(data.message || "Incorrect username or password");
        } 
        else if (status === 404) {
          toast.error(data.message || "Login endpoint not found.");
        } 
        else {
          toast.error(data.message || "An unknown server error occurred.");
        }
      } else if (error.request) {
        toast.error("Login service is unavailable. Please try again later.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- NO CHANGES to the JSX form ---
  // The role dropdown will still *show* the selected role,
  // but our new handleSubmit function *ignores* it for security.
  // The 'Signup' form (when you build it) will be the one to use this.
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

        {/* Login Form (No changes here) */}
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
          {/* This is now just a visual for when you switch roles from App.jsx */}
          <div>
            <label 
              htmlFor="role" 
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </span>
              <select
                id="role"
                name="role"
                required
                // We'll disable it to show the user they can't change it here
                disabled={true} 
                className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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