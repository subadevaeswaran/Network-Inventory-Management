package com.project.NetworkApp.Service;



import com.project.NetworkApp.DTO.DeploymentTaskCreateDTO;
import com.project.NetworkApp.DTO.DeploymentTaskDTO;
import com.project.NetworkApp.DTO.CompleteTaskRequestDTO;
import com.project.NetworkApp.Repository.*;
import com.project.NetworkApp.entity.*;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.CustomerStatus;
import com.project.NetworkApp.enums.TaskStatus;
import com.project.NetworkApp.Utility.DeploymentTaskUtility; // Ensure you have this utility
import com.project.NetworkApp.exception.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeploymentTaskServiceImpl implements DeploymentTaskService {

    private final DeploymentTaskRepository taskRepository;
    private final AssetRepository assetRepository;
    private final AssignedAssetsRepository assignedAssetsRepository;
    private final CustomerRepository customerRepository;
    private final AuditLogService auditLogService;
    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private static final Logger log = LoggerFactory.getLogger(DeploymentTaskServiceImpl.class);


    @Override
    public List<DeploymentTaskDTO> getTechnicianTasksByStatus(Integer technicianId, TaskStatus status) {
        List<DeploymentTask> tasks = taskRepository.findByTechnicianIdAndStatus(technicianId, status);
        // Ensure DeploymentTaskUtility exists and has the toDTO method
        return tasks.stream().map(DeploymentTaskUtility::toDTO).toList();
    }

    @Override
    @Transactional // Ensures all steps succeed or fail together
    public void completeTask(Integer taskId, CompleteTaskRequestDTO dto) {
        // 1. Find the Task & associated Customer
        DeploymentTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TechnicianNotFoundException("Task not found: " + taskId));
        Customer customer = task.getCustomer();
        if (customer == null) throw new CustomerStatusException("Customer not found for task: " + taskId);

        // Validate task status (e.g., must be SCHEDULED or INPROGRESS)
        if (task.getStatus() != TaskStatus.SCHEDULED && task.getStatus() != TaskStatus.INPROGRESS) {
            throw new TaskNotFoundException("Task cannot be completed from its current status: " + task.getStatus());
        }

        // 2. Find and Validate Assets (ONT and Router must be AVAILABLE)
        Asset ont = findAndValidateAsset(dto.ontAssetId(), AssetStatus.AVAILABLE);
        Asset router = findAndValidateAsset(dto.routerAssetId(), AssetStatus.AVAILABLE);

        // --- Database Updates ---

        // 3. Update Task Status & Notes
        task.setStatus(TaskStatus.COMPLETED);
        task.setNotes( (task.getNotes() != null ? task.getNotes() + "\n" : "") + "Completed: " + (dto.completionNotes() != null ? dto.completionNotes() : ""));
        taskRepository.save(task); // Update 'deployment_tasks' table

        // 4. Update Asset Statuses & assign date/customer
        updateAssetAssignment(ont, customer);    // Updates 'assets' table for ONT
        updateAssetAssignment(router, customer); // Updates 'assets' table for Router

        // 5. Create AssignedAssets links
        createAssignedAssetLink(customer, ont);    // Creates row in 'assigned_assets' table
        createAssignedAssetLink(customer, router); // Creates row in 'assigned_assets' table

        // 6. Update Customer Status to ACTIVE
        customer.setStatus(CustomerStatus.ACTIVE);
        customerRepository.save(customer); // Updates 'customers' table


        String description = "Completed Task ID: " + task.getId() +
                " for Customer '" + customer.getName() + "' (CusID: " + customer.getId() + "). " +
                "Assigned ONT: " + ont.getSerialNumber() + " (OntId: " + ont.getId() + "), " +
                "Router: " + router.getSerialNumber() + " (RouterId: " + router.getId() + "). " +
                "Notes: " + dto.completionNotes();
        auditLogService.logAction("TASK_COMPLETE", description, dto.operatorId());

        // --- End Database Updates ---
    }
    // Helper to find and validate asset
    // Helper to find and validate asset
    private Asset findAndValidateAsset(Integer assetId, AssetStatus expectedStatus) {
        if (assetId == null) {
            throw new AssetIdNullException("Asset ID cannot be null for assignment.");
        }
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new AssetNotFoundException("Asset not found: " + assetId));
        if (asset.getStatus() != expectedStatus) {
            throw new AssetNotFoundException("Asset " + assetId + " ("+asset.getSerialNumber()+") is not in the expected status: " + expectedStatus + ", current status: " + asset.getStatus());
        }
        return asset;
    }

    // Helper to update asset status and assignment details
    private void updateAssetAssignment(Asset asset, Customer customer) {
        asset.setStatus(AssetStatus.ASSIGNED);
        asset.setAssignedToCustomerId(customer.getId());
        asset.setAssignedDate(LocalDateTime.now());
        assetRepository.save(asset); // Saves changes to the 'assets' table
    }
    // Helper to create the link in AssignedAssets table
    private void createAssignedAssetLink(Customer customer, Asset asset) {
        AssignedAssets link = new AssignedAssets();
        link.setCustomer(customer);
        link.setAsset(asset);
        // assignedOn is usually set automatically by @CreationTimestamp in AssignedAssets entity
        assignedAssetsRepository.save(link); // Saves new row to 'assigned_assets' table
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeploymentTaskDTO> getAllTasks(TaskStatus status) {
        List<DeploymentTask> tasks;
        Sort sort = Sort.by(Sort.Direction.DESC, "scheduledDate"); // Sort by date

        if (status != null) {
            // If status is provided, filter by it
            tasks = taskRepository.findByStatus(status, sort);
        } else {
            // If status is null, fetch all
            tasks = taskRepository.findAll(sort);
        }

        return tasks.stream()
                .map(DeploymentTaskUtility::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public DeploymentTaskDTO createDeploymentTask(DeploymentTaskCreateDTO dto) {
        // 1. Find related entities
        Customer customer = customerRepository.findById(dto.customerId())
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with ID: " + dto.customerId()));

        Technician technician = technicianRepository.findById(dto.technicianId())
                .orElseThrow(() -> new TechnicianNotFoundException("Technician not found with ID: " + dto.technicianId()));

        // 2. Create new DeploymentTask
        DeploymentTask newTask = new DeploymentTask();
        newTask.setCustomer(customer);
        newTask.setTechnician(technician);
        newTask.setPriority(dto.priority());
        newTask.setScheduledDate(dto.scheduledDate());
        newTask.setNotes(dto.notes());
        newTask.setStatus(TaskStatus.SCHEDULED); // Default to SCHEDULED

        // 3. Save the new task
        DeploymentTask savedTask = taskRepository.save(newTask);

        // 4. Log the audit event
        Integer currentUser= technician.getUser().getId();
        String description = "Created Task " + savedTask.getId() + " for Customer '" + customer.getName() +
                "' (ID: " + customer.getId() + ") and assigned to Technician '" +
                technician.getName() + "' (ID: " + technician.getId() + ").";
        // Pass 'null' for userId until security is implemented
        auditLogService.logAction("TASK_CREATE", description, currentUser);

        // 5. Return the DTO
        return DeploymentTaskUtility.toDTO(savedTask);
    }


}
