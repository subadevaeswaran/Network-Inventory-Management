// src/components/AllTasksView.jsx
import React, { useState , useEffect } from 'react';
import { Plus, CheckCircle, AlertCircle, Play, ListTodo } from 'lucide-react'; // Import necessary icons
import Modal from 'react-modal'; // Use react-modal
import { toast } from 'react-toastify'; // Use sonner
import { X } from 'lucide-react'; // Import close icon
import apiClient from '../api/apiClient';


// Set modal app element for accessibility
Modal.setAppElement('#root');

// --- Mock Data ---
// (This would be fetched from GET /tasks in a real app)
// const tasks = [
//   { id: 'TSK-001', customer: 'House A1.2', assignedTo: 'Suresh Reddy', status: 'Pending', priority: 'High', dueDate: '2025-10-20' },
//   { id: 'TSK-002', customer: 'House B1.2', assignedTo: 'Rajesh Kumar', status: 'In Progress', priority: 'Medium', dueDate: '2025-10-19' },
//   { id: 'TSK-003', customer: 'Customer 003', assignedTo: 'Amit Patel', status: 'Completed', priority: 'Low', dueDate: '2025-10-18' },
//   { id: 'TSK-004', customer: 'House C3.4', assignedTo: 'Suresh Reddy', status: 'In Progress', priority: 'High', dueDate: '2025-10-21' },
//   { id: 'TSK-005', customer: 'House D2.1', assignedTo: 'Priya Singh', status: 'Pending', priority: 'Medium', dueDate: '2025-10-22' },
// ];

// --- Helper Functions for Badges ---
const getStatusBadge = (status) => {
  if (!status) return ;
  let className = "bg-gray-100 text-gray-700";
  let displayStatus = status.charAt(0) + status.slice(1).toLowerCase(); // e.g., "Scheduled"

  switch (status) {
    case 'PENDING': className = "bg-yellow-100 text-yellow-700"; break;
    case 'SCHEDULED': className = "bg-cyan-100 text-cyan-700"; break;
    case 'INPROGRESS': className = "bg-blue-100 text-blue-700"; displayStatus = "In Progress"; break;
    case 'COMPLETED': className = "bg-green-100 text-green-700"; break;
    case 'FAILED': className = "bg-red-100 text-red-700"; break;
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{displayStatus}</span>;
};
const getPriorityBadge = (priority) => {
  let className = "bg-gray-100 text-gray-700"; // Default
  switch (priority) {
    case 'High':
      className = "bg-red-100 text-red-700"; break;
    case 'Medium':
      className = "bg-orange-100 text-orange-700"; break;
    case 'Low':
      className = "bg-gray-100 text-gray-700"; break;
    default:

  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>{priority}</span>;
};


export default function AllTasksView() {
  // State for the "Create Task" modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for fetched tasks (using mock data for now)
  const [allTasks, setAllTasks] = useState([]);
  // State for modal form fields
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [customerList, setCustomerList] = useState([]); // For customer dropdown
  const [technicianList, setTechnicianList] = useState([]); // For technician dropdown
  const [isModalLoading, setIsModalLoading] = useState(false); // For modal dropdowns
  const [isSubmitting, setIsSubmitting] = useState(false); // For modal submit button
  


  // --- Fetch Tasks on Component Mount ---
 const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Create params object
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter; // Add status param if not 'ALL'
      }

      const response = await apiClient.get('/tasks', { params }); // Pass params
      setAllTasks(response.data);
    } catch (error) {
      toast.error("Failed to fetch deployment tasks.");
      console.error("Fetch tasks error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchTasks(); // Fetch tasks when component loads
  }, [statusFilter]);

  // --- Fetch Modal Dropdown Data when Modal Opens ---
  useEffect(() => {
    if (isModalOpen) {
      const fetchModalData = async () => {
        setIsModalLoading(true);
        try {
          // Fetch both customer and technician lists
          const [customerRes, techRes] = await Promise.all([
            apiClient.get('/customer'),     // Fetch all customers
            apiClient.get('/technicians') // Fetch all technicians
          ]);
          setCustomerList(customerRes.data);
          setTechnicianList(techRes.data);
       
        } catch (error) {
          toast.error("Failed to load data for task creation.");
          console.error("Modal fetch error:", error);
        } finally {
          setIsModalLoading(false);
        }
      };
      fetchModalData();
      
      // Reset form fields
      setSelectedCustomer('');
      setSelectedTechnician('');
      setSelectedPriority('Medium');
      setDueDate('');
      setTaskDescription('');
    }
  }, [isModalOpen]); // Run only when modal opens

 const handleCreateTask = async () => {
    // Validation
    if (!selectedCustomer || !selectedTechnician || !selectedPriority || !dueDate || !taskDescription) {
      toast.warning('Please fill in all fields to create the task.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const taskData = {
        customerId: parseInt(selectedCustomer, 10),
        technicianId: parseInt(selectedTechnician, 10),
        priority: selectedPriority,
        scheduledDate: dueDate,
        notes: taskDescription,
      };

      // Call the new POST /tasks endpoint
      await apiClient.post('/tasks', taskData);
      
      toast.success('Deployment task created successfully!');
      setIsModalOpen(false); // Close modal
      fetchTasks(); // Refetch tasks table
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to create task.";
      toast.error(errorMsg);
      console.error("Create task error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskStatuses = ['ALL', 'SCHEDULED', 'INPROGRESS', 'COMPLETED', 'FAILED'];


  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className='flex items-center gap-3'>
          <div className="p-2 bg-gray-100 rounded-lg border border-gray-200 hidden md:block">
             <ListTodo className="h-6 w-6 text-gray-700" />
           </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              All Deployment Tasks
            </h2>
            <p className="text-sm text-gray-600">
              Plan and manage all deployment tasks for technicians.
            </p>
          </div>
        </div>
         {/* --- 4. Add Status Filter Dropdown --- */}
          <div className="flex items-center ">
            
            <select
              id="taskStatusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 block border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {taskStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'All Statuses' : (status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' '))}
                </option>
              ))}
            </select>
          </div>
        <div className="flex gap-3">
          {/* Create Task Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Deployment Task
          </button>
        </div>
      </div>

      {/* --- Main Task Table Card --- */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Card Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Tasks</h3>
         
          {/* ---------------------------------- */}
        </div>
        {/* Card Content - Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="7" className="text-center py-6 text-gray-500">Loading tasks...</td></tr>
              ) : allTasks.length === 0 ? (
                // Improved empty message
                <tr><td colSpan="7" className="text-center py-6 text-gray-500">
                  No deployment tasks found{statusFilter !== 'ALL' ? ` with status '${statusFilter}'` : ''}.
                </td></tr>
              ) : (
                allTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">TSK-{task.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{task.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{task.technicianName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(task.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getPriorityBadge(task.priority || 'N/A')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.scheduledDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* --- End Task Table Card --- */}


      {/* --- Create Task Modal --- */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Create New Deployment Task"
          className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
          overlayClassName="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Create New Deployment Task</h2>
            <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Form */}
          <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
            {/* Customer Dropdown */}
            <div>
              <label htmlFor="customerSelect" className="block text-sm font-medium text-gray-700">Customer *</label>
              <select
                id="customerSelect"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                disabled={isModalLoading}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="" disabled>{isModalLoading ? 'Loading customers...' : 'Select customer'}</option>
                {/* Map over customerList */}
                {customerList.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} (ID: {customer.id})
                  </option>
                ))}
              </select>
            </div>
            {/* Technician Dropdown */}
            <div>
              <label htmlFor="technicianSelect" className="block text-sm font-medium text-gray-700">Assign To *</label>
              <select
                id="technicianSelect"
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                disabled={isModalLoading}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="" disabled>{isModalLoading ? 'Loading technicians...' : 'Select technician'}</option>
                {/* Map over technicianList */}
                {technicianList.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} (Region: {tech.region})
                  </option>
                ))}
              </select>
            </div>
            {/* Priority Dropdown */}
            <div>
              <label htmlFor="prioritySelect" className="block text-sm font-medium text-gray-700">Priority *</label>
              <select
                id="prioritySelect"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            {/* Due Date Input */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date *</label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Description Textarea */}
            <div>
              <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700">Task Description (Notes) *</label>
              <textarea
                id="taskDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task details..."
                rows={4}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 flex justify-end space-x-3 border-t bg-gray-50">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
              disabled={isSubmitting} // Disable while submitting
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTask}
              disabled={isModalLoading || isSubmitting} // Disable while loading or submitting
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </Modal>
      )}
      {/* --- End Modal --- */}

    </div>
  );
}