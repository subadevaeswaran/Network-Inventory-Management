import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import { Listbox } from '@headlessui/react';
import { XMarkIcon, ChevronUpDownIcon, CheckIcon , BuildingStorefrontIcon , ComputerDesktopIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

Modal.setAppElement('#root');

// Reusable CustomSelect component (make sure this is imported or defined here)
function CustomSelect({ label, data = [], selected, onChange, displayKey, disabled = false }) {
    const isObjectArray = displayKey && data.length > 0 && typeof data[0] === 'object' && data[0] !== null;
    let buttonDisplayValue = 'Select...';
    if (selected) { buttonDisplayValue = isObjectArray ? selected?.[displayKey] : selected; }
    if (isObjectArray && selected && !selected?.[displayKey]) { buttonDisplayValue = 'Loading...'; }

    return (
      <Listbox value={selected} onChange={onChange} disabled={disabled}>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative mt-1">
          <Listbox.Button /* ... same styling as before ... */>
             <span className="block truncate">{buttonDisplayValue}</span>
             <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
               <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
             </span>
          </Listbox.Button>
          <Listbox.Options /* ... same styling as before ... */>
            {Array.isArray(data) && data.map((item, index) => {
                const optionKey = isObjectArray ? item?.id ?? `item-${index}` : `item-${index}`;
                const optionDisplayValue = isObjectArray ? item?.[displayKey] : item;
                if (item === null || item === undefined) return null;
                return ( <Listbox.Option key={optionKey} value={item} /* ... className ... */ >
                    {({ selected: isSelected }) => ( <>
                        <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>{optionDisplayValue ?? ''}</span>
                        {isSelected && ( <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"><CheckIcon className="h-5 w-5" /></span>)}
                    </>)}
                  </Listbox.Option> );
            })}
          </Listbox.Options>
        </div>
      </Listbox>
    );
}
// ----- End of CustomSelect -----


const TaskDetailsModal = ({ isOpen, onRequestClose, task }) => {
    const [availableOnts, setAvailableOnts] = useState([]);
    const [availableRouters, setAvailableRouters] = useState([]);
    const [selectedOnt, setSelectedOnt] = useState(null);
    const [selectedRouter, setSelectedRouter] = useState(null);
    const [completionNotes, setCompletionNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [assignedAssets, setAssignedAssets] = useState([]);
    const [isFetchingAssets, setIsFetchingAssets] = useState(false); // Separate loading for assets

    const [isFetchingAssigned, setIsFetchingAssigned] = useState(false);

    const isCompleted = task?.status === 'COMPLETED';
    // Fetch available assets when modal opens
    // --- Fetch AVAILABLE ONTs ---
    useEffect(() => {
        // Only run if modal is open AND task is NOT completed
        if (isOpen && !isCompleted ) {
            const fetchOnts = async () => {
                setIsFetchingAssets(true); // Indicate loading starts
                try {
                    const response = await apiClient.get(`/assets/available?type=ONT`);
                    setAvailableOnts(response.data);
                    setSelectedOnt(null); // Reset selection when data loads/reloads
                } catch (error) {
                    toast.error(`Failed to load available ONTs.`);
                    console.error("Fetch ONT error:", error);
                    setAvailableOnts([]); // Clear list on error
                } finally {
                    // Consider setting loading false only after BOTH fetchAssets are done
                    // For simplicity now, we set it here. Might cause brief flicker.
                    // A better approach might use Promise.all outside useEffect if combined loading state is needed.
                    setIsFetchingAssets(false);
                }
            };
            fetchOnts();
        } else if (!isOpen) {
             setAvailableOnts([]); // Clear list when modal closes
             setSelectedOnt(null);
        }
    }, [isOpen, isCompleted]); // Depend on modal state and completion status

    // --- Fetch AVAILABLE Routers ---
    useEffect(() => {
         // Only run if modal is open AND task is NOT completed
        if (isOpen && !isCompleted) {
            const fetchRouters = async () => {
                setIsFetchingAssets(true); // Indicate loading starts
                try {
                    const response = await apiClient.get(`/assets/available?type=ROUTER`);
                    setAvailableRouters(response.data);
                    setSelectedRouter(null); // Reset selection when data loads/reloads
                    // Reset notes only once, maybe here or in the ONT fetch
                    setCompletionNotes(task?.notes || '');
                } catch (error) {
                    toast.error(`Failed to load available Routers.`);
                    console.error("Fetch Router error:", error);
                    setAvailableRouters([]); // Clear list on error
                } finally {
                    setIsFetchingAssets(false); // See note in ONT fetch about combined loading state
                }
            };
            fetchRouters();
        } else if (!isOpen) {
             setAvailableRouters([]); // Clear list when modal closes
             setSelectedRouter(null);
        }
    }, [isOpen, isCompleted, task]); // Only depends on isOpen

    // --- NEW: Fetch ASSIGNED assets if task is COMPLETED ---
  useEffect(() => {
    // Check conditions: modal open, task is completed, customer ID exists
    if (isOpen && isCompleted && task?.customerId) {
      const fetchAssigned = async () => {
        setIsFetchingAssigned(true);
        try {
          // --- Verify this line ---
          // It should call '/assigned-assets/by-customer/' followed by the customer ID
          const response = await apiClient.get(`/assigned-assets/by-customer/${task.customerId}`);
          // -----------------------
          setAssignedAssets(response.data); // Update state with the response
        } catch (error) {
          toast.error("Failed to load assigned asset details.");
          console.error("Fetch assigned error:", error);
        } finally {
          setIsFetchingAssigned(false);
        }
      };
      fetchAssigned(); // Execute the fetch function
    }
  }, [isOpen, isCompleted, task]); // Dependencies for the effect

    const handleComplete = async () => {
         if (!selectedOnt || !selectedRouter) {
             toast.warn("Please select both an ONT and a Router to complete.");
             return;
         }
        setIsLoading(true); // Start main loading state
        const completionData = {
            ontAssetId: selectedOnt.id,
            routerAssetId: selectedRouter.id,
            completionNotes: completionNotes
        };

        try {
            // Call the backend endpoint to complete the task
            await apiClient.post(`/tasks/${task.id}/complete`, completionData);
            toast.success("Task completed successfully!");
            onRequestClose(); // Close modal and trigger refresh in dashboard

        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to complete task.";
            toast.error(errorMsg);
            console.error("Completion failed:", error);
        } finally {
            setIsLoading(false); // End main loading state
        }
    };

    // Determine if the "Complete" button should be enabled
    const canComplete = selectedOnt && selectedRouter && !isLoading;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel={isCompleted ? "Installation Report" : "Task Details"}// Added label
            className="relative z-50 w-full max-w-xl bg-white rounded-lg shadow-xl overflow-hidden"
            overlayClassName="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gray-50 rounded-t-lg"> {/* Added header bg */}
                <h2 className="text-xl font-semibold text-gray-800">Task Details: Install for {isCompleted ? "Installation Report:" : "Task Details:"} {task?.customerName}</h2>
                <button onClick={onRequestClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6"> {/* Increased spacing */}
                {/* Display Task/Customer Info */}
                <section className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Customer & Assignment</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="sm:col-span-1"><dt className="font-medium text-gray-500">Name:</dt><dd className="text-gray-900">{task?.customerName}</dd></div>
                        <div className="sm:col-span-1"><dt className="font-medium text-gray-500">Scheduled:</dt><dd className="text-gray-900">{task?.scheduledDate || 'N/A'}</dd></div>
                        <div className="sm:col-span-2"><dt className="font-medium text-gray-500">Address:</dt><dd className="text-gray-900">{task?.customerAddress}</dd></div>
                        <div className="sm:col-span-2"><dt className="font-medium text-gray-500">Planner Notes:</dt><dd className="text-gray-700 italic">{task?.notes || 'None'}</dd></div>
                        {/* You might fetch and display Splitter/Port info here too */}
                    </dl>
                </section>
{/* --- Conditional Rendering --- */}
                {isCompleted ? (
                    // --- REPORT VIEW ---
                    <section>
                        <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Installation Summary</h3>
                        {isFetchingAssigned ? (<p>Loading assigned assets...</p>) : (
                             <div className="space-y-4 text-sm">
                                {assignedAssets.map(asset => (
                                    <div key={asset.assignedAssetId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded border">
                                        {asset.assetType === 'ONT' ? <BuildingStorefrontIcon className="h-6 w-6 text-gray-500"/> : <ComputerDesktopIcon className="h-6 w-6 text-gray-500"/>}
                                        <div>
                                            <p className="font-medium text-gray-800">{asset.assetType}</p>
                                            <p className="text-gray-600">Model: {asset.model}</p>
                                            <p className="text-gray-600">S/N: {asset.serialNumber}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        )}
                        <div className="mt-4">
                            <h4 className="font-medium text-gray-600 mb-1">Technician Notes:</h4>
                            <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded border italic">
                                {completionNotes || "No completion notes entered."}
                            </p>
                        </div>
                    </section>
                ) : (
                    // --- INSTALLATION VIEW (Asset Selection & Notes) ---
                    <>
                        <section>
                            <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Assign Physical Assets</h3>
                            {isFetchingAssets ? ( <p className="text-gray-500">Loading available devices...</p> ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <CustomSelect
                                        label="1. Select/Scan ONT"
                                        data={availableOnts}
                                        selected={selectedOnt}
                                        onChange={setSelectedOnt}
                                        displayKey="serialNumber"
                                    />
                                    <CustomSelect
                                        label="2. Select/Scan Router"
                                        data={availableRouters}
                                        selected={selectedRouter}
                                        onChange={setSelectedRouter}
                                        displayKey="serialNumber"
                                    />
                                </div>
                            )}
                        </section>
                        <section>
                            <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Installation Report</h3>
                            <div>
                               <label htmlFor="completionNotes" className="block text-sm font-medium text-gray-700">Completion Notes (Signal Strength, Issues, etc.)</label>
                               <textarea
                                 id="completionNotes"
                                 rows="4"
                                 value={completionNotes}
                                 onChange={(e) => setCompletionNotes(e.target.value)}
                                 className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                 placeholder="e.g., Signal -18dBm at ONT..."
                               />
                            </div>
                        </section>
                    </>
                )}
                {/* --- End Conditional Rendering --- */}

            </div>

            {/* Footer Actions */}
            <div className="p-6 flex justify-between items-center border-t bg-gray-50 rounded-b-lg">
                 {/* Show different buttons based on status */}
                 {!isCompleted ? (
                     <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400 text-sm">
                         Mark In Progress
                     </button>
                 ) : ( <div/> ) /* Placeholder to keep layout consistent */}

                <div className="flex space-x-3">
                    <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">
                        Close
                    </button>
                    {/* Only show Complete button if task is not completed */}
                    {!isCompleted && (
                        <button
                            type="button"
                            onClick={handleComplete}
                            disabled={!selectedOnt || !selectedRouter || isLoading || isFetchingAssets} // Disable while fetching assets too
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm"
                        >
                            {isLoading ? 'Completing...' : 'Complete Installation'}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default TaskDetailsModal;