import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import { ListBulletIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import TaskDetailsModal from './TaskDetailsModal'; // Ensure this is created/imported

// Accepts technicianId and activeView (status) from App.js
const TechnicianDashboard = ({ technicianId, activeView , user }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map view state to API status parameter
  const statusMap = {
    SCHEDULED: 'SCHEDULED',
    INPROGRESS: 'INPROGRESS', // Assuming you add this status later
    COMPLETED: 'COMPLETED',
  };

  const fetchTasks = async (status) => {
      setIsLoading(true);
      try {
          const apiStatus = statusMap[status];
          if (!apiStatus) {
              toast.error("Invalid task view selected.");
              setTasks([]);
              setIsLoading(false); // Stop loading on invalid status
              return;
          }
          // Call backend endpoint using technicianId and the selected status
          const response = await apiClient.get(`/tasks/my-tasks?technicianId=${technicianId}&status=${apiStatus}`);
          setTasks(response.data);
      } catch (error) {
          toast.error(`Could not fetch ${status.toLowerCase()} tasks.`);
          console.error(error);
          setTasks([]); // Clear tasks on error
      } finally {
          setIsLoading(false);
      }
  };

  // Refetch tasks when technicianId or activeView changes
  useEffect(() => {
      if (technicianId && technicianId > 0 && activeView) {
          fetchTasks(activeView);
      } else if (!technicianId) {
          // toast.warn("Technician ID not available, cannot fetch tasks."); // Avoid spamming toast
          setIsLoading(false);
          setTasks([]);
      }
  }, [technicianId, activeView]);

  const handleViewTask = (task) => {
      setSelectedTask(task);
      setIsModalOpen(true);
  };

  const handleModalClose = () => {
      setIsModalOpen(false);
      setSelectedTask(null);
      // Refresh list for the current view after modal closes
      if (activeView) {
        fetchTasks(activeView);
      }
  };

  // Helper to get title and icon based on active view
  const getDashboardTitleAndIcon = () => {
      switch(activeView) {
          case 'INPROGRESS':
              return { title: 'In-Progress Tasks', Icon: ClockIcon, iconColor: 'text-yellow-500' };
          case 'COMPLETED':
              return { title: 'Completed Tasks', Icon: CheckCircleIcon, iconColor: 'text-green-500' };
          case 'SCHEDULED':
          default:
              return { title: 'Scheduled Tasks', Icon: ListBulletIcon, iconColor: 'text-blue-500' };
      }
  };

  const { title, Icon, iconColor } = getDashboardTitleAndIcon();

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {title}
      </h2>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            <li className="p-4 text-center text-gray-500">Loading tasks...</li>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4 min-w-0"> {/* Added min-w-0 */}
                  <Icon className={`h-8 w-8 ${iconColor} flex-shrink-0`} />
                  <div className="min-w-0"> {/* Added min-w-0 */}
                    <p className="text-lg font-semibold text-gray-900 truncate">Install for: {task.customerName}</p> {/* Added truncate */}
                    <p className="text-sm text-gray-600 truncate">{task.customerAddress}</p> {/* Added truncate */}
                    <p className="text-sm text-gray-500">Scheduled: {task.scheduledDate || 'Not set'}</p>
                    {task.notes && <p className="text-xs text-gray-500 mt-1 truncate">Notes: {task.notes}</p>} {/* Added truncate */}
                  </div>
                </div>
                <button
                  onClick={() => handleViewTask(task)}
                  className={`flex items-center text-white px-3 py-2 rounded-lg shadow-md text-sm hover:opacity-90 whitespace-nowrap ${
                    activeView === 'COMPLETED' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {activeView === 'COMPLETED' ? 'View Report' : 'View Details'}
                </button>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">
              No {activeView.toLowerCase()} tasks found.
            </li>
          )}
        </ul>
      </div>

      {/* Task Details Modal */}
      {/* Ensure modal only renders when needed */}
      {isModalOpen && selectedTask && (
          <TaskDetailsModal
              isOpen={isModalOpen}
              onRequestClose={handleModalClose}
              task={selectedTask} // Pass the full task object
              user={user}
          />
      )}
    </div>
  );
};

export default TechnicianDashboard;