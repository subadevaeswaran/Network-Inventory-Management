package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;

import com.project.NetworkApp.DTO.AssignmentRequestDTO;
import com.project.NetworkApp.Repository.*;
import com.project.NetworkApp.entity.*;
import com.project.NetworkApp.enums.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Important for multiple updates

import java.time.LocalDate;
import java.time.LocalDateTime;
// package com.project.NetworkApp.service;

// ... other imports

// package com.project.NetworkApp.service;

// ... other imports
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {

    private final CustomerRepository customerRepository;
    private final SplitterRepository splitterRepository;
    private final DeploymentTaskRepository deploymentTaskRepository;
    private final FiberDropLineRepository fiberDropLineRepository;
    private final TechnicianRepository technicianRepository;
    private final AssetRepository assetRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public void assignNetworkPath(AssignmentRequestDTO dto) {
        // 1. Find Customer (Check status)
        Customer customer = customerRepository.findById(dto.customerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + dto.customerId()));
        if (customer.getStatus() != CustomerStatus.PENDING) {
            throw new IllegalStateException("Customer is not in PENDING status.");
        }

        // 2. Find Splitter
        Splitter splitter = splitterRepository.findById(dto.splitterId())
                .orElseThrow(() -> new EntityNotFoundException("Splitter not found: " + dto.splitterId()));
        Asset splitterAsset = assetRepository.findByAssetTypeAndRelatedEntityId(AssetType.SPLITTER, splitter.getId())
                .orElse(null);


        if (splitterAsset != null) {
            if (splitterAsset.getStatus() == AssetStatus.AVAILABLE) {
                splitterAsset.setAssignedToCustomerId(customer.getId());
                splitterAsset.setAssignedDate(LocalDateTime.now());
                splitterAsset.setStatus(AssetStatus.ASSIGNED);
                assetRepository.save(splitterAsset); // Update status if needed
                System.out.println(">>> Updated Splitter Asset " + splitterAsset.getId() + " status to ASSIGNED.");
            }
        } else {
            System.err.println("Warning: Could not find Asset record for Splitter ID: " + splitter.getId());
        }
        Fdh parentFdh = splitter.getFdh();
        if (parentFdh != null) {
            Asset fdhAsset = assetRepository.findByAssetTypeAndRelatedEntityId(AssetType.FDH, parentFdh.getId())
                    .orElse(null); // Find the corresponding Asset record for the FDH

            if (fdhAsset != null) {
                if (fdhAsset.getStatus() == AssetStatus.AVAILABLE) {
                    fdhAsset.setAssignedToCustomerId(customer.getId());
                    fdhAsset.setAssignedDate(LocalDateTime.now());
                    fdhAsset.setStatus(AssetStatus.ASSIGNED);
                    assetRepository.save(fdhAsset); // Update status if needed
                    System.out.println(">>> Updated FDH Asset " + fdhAsset.getId() + " status to ASSIGNED.");
                }
            } else {
                System.err.println("Warning: Could not find Asset record for FDH ID: " + parentFdh.getId());
            }
        }

        Technician technician = technicianRepository.findById(dto.technicianId())
                .orElseThrow(() -> new EntityNotFoundException("Technician not found: " + dto.technicianId()));
        System.out.println("Found Technician: " + technician.getName());
        // --- Add Validation (Optional but Recommended) ---
        // Check if port number is valid
        if (dto.port() <= 0 || dto.port() > splitter.getPortCapacity()) {
            throw new IllegalArgumentException("Invalid port number for splitter capacity.");
        }

        // Check if port is already taken (more complex query needed, add later)
        // ---------------------------------------------

        // 3. Update Customer
        customer.setSplitter(splitter);
        customer.setAssignedPort(dto.port());
        customer.setNeighborhood(dto.neighborhood());
        customer.setStatus(CustomerStatus.SCHEDULED);
        customerRepository.save(customer);

        // 4. Create FiberDropLine
        FiberDropLine fiberLine = new FiberDropLine();
        fiberLine.setSplitter(splitter);
        fiberLine.setCustomer(customer);
        fiberLine.setLengthMeters(dto.fiberLengthMeters());
        fiberLine.setStatus(FiberLineStatus.ACTIVE);
        fiberDropLineRepository.save(fiberLine);

        // --- **FIX: Update Splitter's used port count** ---
        splitter.setUsedPorts(splitter.getUsedPorts() + 1); // Increment count
        splitterRepository.save(splitter); // Save the updated splitter
        // ---------------------------------------------------

        // 6. Create Deployment Task
        DeploymentTask newTask = new DeploymentTask();
        newTask.setCustomer(customer);
        newTask.setTechnician(technician); // <-- Is this line present and using the 'technician' variable?
        newTask.setStatus(TaskStatus.SCHEDULED);
        newTask.setScheduledDate(LocalDate.now().plusDays(1));
        newTask.setNotes("Assign network path: Splitter " + splitter.getId() + ", Port " + dto.port() + ". Fiber Length: " + dto.fiberLengthMeters() + "m");
        deploymentTaskRepository.save(newTask);
        Integer currentUserId = null; // Set to null
        String description = "Assigned network path (Splitter: " + splitter.getId() +
                ", Port: " + dto.port() +
                ", Neighborhood: " + dto.neighborhood() +
                ", Tech: " + technician.getName() +
                ") to Customer '" + customer.getName() + "' (ID: " + customer.getId() + ")";
        auditLogService.logAction("ASSIGNMENT_CREATE", description, dto.operatorId());
    }
}