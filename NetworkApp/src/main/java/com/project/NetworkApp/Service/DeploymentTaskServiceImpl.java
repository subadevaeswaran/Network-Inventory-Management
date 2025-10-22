package com.project.NetworkApp.Service;



import com.project.NetworkApp.DTO.DeploymentTaskDTO;
import com.project.NetworkApp.DTO.CompleteTaskRequestDTO;
import com.project.NetworkApp.DTO.DeploymentTaskDTO;
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.entity.AssignedAssets;
import com.project.NetworkApp.entity.Customer;
import com.project.NetworkApp.entity.DeploymentTask;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.CustomerStatus;
import com.project.NetworkApp.enums.TaskStatus;
import com.project.NetworkApp.Repository.AssetRepository;
import com.project.NetworkApp.Repository.AssignedAssetsRepository;
import com.project.NetworkApp.Repository.CustomerRepository;
import com.project.NetworkApp.Repository.DeploymentTaskRepository;
import com.project.NetworkApp.Utility.DeploymentTaskUtility; // Ensure you have this utility
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeploymentTaskServiceImpl implements DeploymentTaskService {

    private final DeploymentTaskRepository taskRepository;
    private final AssetRepository assetRepository;
    private final AssignedAssetsRepository assignedAssetsRepository;
    private final CustomerRepository customerRepository;

    @Override
    public List<DeploymentTaskDTO> getTechnicianTasksByStatus(Integer technicianId, TaskStatus status) {
        List<DeploymentTask> tasks = taskRepository.findByTechnicianIdAndStatus(technicianId, status);
        // Ensure DeploymentTaskUtility exists and has the toDTO method
        return tasks.stream().map(DeploymentTaskUtility::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional // Ensures all steps succeed or fail together
    public void completeTask(Integer taskId, CompleteTaskRequestDTO dto) {
        // 1. Find the Task & associated Customer
        DeploymentTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
        Customer customer = task.getCustomer();
        if (customer == null) throw new EntityNotFoundException("Customer not found for task: " + taskId);

        // Validate task status (e.g., must be SCHEDULED or INPROGRESS)
        if (task.getStatus() != TaskStatus.SCHEDULED && task.getStatus() != TaskStatus.INPROGRESS) {
            throw new IllegalStateException("Task cannot be completed from its current status: " + task.getStatus());
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

        // --- End Database Updates ---
    }
    // Helper to find and validate asset
    // Helper to find and validate asset
    private Asset findAndValidateAsset(Integer assetId, AssetStatus expectedStatus) {
        if (assetId == null) {
            throw new IllegalArgumentException("Asset ID cannot be null for assignment.");
        }
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found: " + assetId));
        if (asset.getStatus() != expectedStatus) {
            throw new IllegalStateException("Asset " + assetId + " ("+asset.getSerialNumber()+") is not in the expected status: " + expectedStatus + ", current status: " + asset.getStatus());
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
}
