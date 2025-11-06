package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.FaultyDeviceSwapDTO;
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.entity.AssignedAssets;
import com.project.NetworkApp.entity.Customer;
import com.project.NetworkApp.entity.FaultReport;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import com.project.NetworkApp.Repository.AssetRepository;
import com.project.NetworkApp.Repository.AssignedAssetsRepository;
import com.project.NetworkApp.Repository.FaultReportRepository;
import com.project.NetworkApp.Service.AuditLogService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DeviceSwapServiceImpl implements DeviceSwapService {

    private final AssetRepository assetRepository;
    private final AssignedAssetsRepository assignedAssetsRepository;
    private final FaultReportRepository faultReportRepository;
    private final AuditLogService auditLogService;
    // We don't need CustomerRepository, we can get the customer from the old assignment

    @Override
    @Transactional
    public void reportAndSwapFaultyDevice(FaultyDeviceSwapDTO dto) {

        // 1. Find and validate the FAULTY asset
        Asset faultyAsset = assetRepository.findById(dto.faultyAssetId())
                .orElseThrow(() -> new EntityNotFoundException("Faulty Asset not found with ID: " + dto.faultyAssetId()));

        if (faultyAsset.getStatus() != AssetStatus.ASSIGNED) {
            throw new IllegalStateException("Device " + faultyAsset.getSerialNumber() + " is not currently ASSIGNED.");
        }
        if (faultyAsset.getAssetType() != AssetType.ONT && faultyAsset.getAssetType() != AssetType.ROUTER) {
            throw new IllegalStateException("Only ONT or ROUTER assets can be swapped.");
        }

        // 2. Find and validate the REPLACEMENT asset
        Asset replacementAsset = assetRepository.findById(dto.replacementAssetId())
                .orElseThrow(() -> new EntityNotFoundException("Replacement Asset not found with ID: " + dto.replacementAssetId()));

        if (replacementAsset.getStatus() != AssetStatus.AVAILABLE) {
            throw new IllegalStateException("Replacement device " + replacementAsset.getSerialNumber() + " is not AVAILABLE.");
        }
        if (replacementAsset.getAssetType() != faultyAsset.getAssetType()) {
            throw new IllegalStateException("Replacement device type (" + replacementAsset.getAssetType() +
                    ") does not match faulty device type (" + faultyAsset.getAssetType() + ").");
        }

        // 3. Find the original assignment link (and the customer)
        AssignedAssets oldAssignment = assignedAssetsRepository.findByAsset_Id(faultyAsset.getId())
                .orElseThrow(() -> new EntityNotFoundException("No assignment record found for faulty asset ID: " + faultyAsset.getId()));

        Customer customer = oldAssignment.getCustomer();
        if (customer == null) {
            throw new EntityNotFoundException("No customer found for assignment record: " + oldAssignment.getId());
        }

        // --- Start Database Operations ---

        // 4. Create the Fault Report
        FaultReport report = new FaultReport();
        report.setAsset(faultyAsset);
        report.setFaultType(dto.faultType());
        report.setPriority(dto.priority());
        report.setDescription(dto.description());
        report.setReportedDate(dto.reportedDate());
        report.setStatus("RESOLVED_SWAPPED"); // Swapped immediately
        report.setReporterUserId(dto.operatorId());
        faultReportRepository.save(report);

        // 5. Update the FAULTY asset
        faultyAsset.setStatus(AssetStatus.FAULTY);
        faultyAsset.setAssignedToCustomerId(null);
        faultyAsset.setAssignedDate(null);
        assetRepository.save(faultyAsset);

        // 6. Update the REPLACEMENT asset
        replacementAsset.setStatus(AssetStatus.ASSIGNED);
        replacementAsset.setAssignedToCustomerId(customer.getId());
        replacementAsset.setAssignedDate(LocalDateTime.now());
        assetRepository.save(replacementAsset);

        // 7. Update the assigned_assets table (Swap)
        // Remove old link
        assignedAssetsRepository.delete(oldAssignment);
        // Add new link
        AssignedAssets newAssignment = new AssignedAssets();
        newAssignment.setCustomer(customer);
        newAssignment.setAsset(replacementAsset);
        assignedAssetsRepository.save(newAssignment);

        // 8. Log the audit event
        String description = "Swapped faulty asset " + faultyAsset.getSerialNumber() +
                " (ID: " + faultyAsset.getId() + ") with new asset " +
                replacementAsset.getSerialNumber() + " (ID: " + replacementAsset.getId() +
                ") for Customer '" + customer.getName() + "' (ID: " + customer.getId() + ").";
        auditLogService.logAction("ASSET_SWAP", description, dto.operatorId());
    }
}
