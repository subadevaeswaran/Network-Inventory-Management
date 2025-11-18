package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.FaultReportDTO;
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.entity.FaultReport;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.Repository.AssetRepository;
import com.project.NetworkApp.Repository.FaultReportRepository;
import com.project.NetworkApp.exception.AssetNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FaultReportServiceImpl implements FaultReportService {

    private final AssetRepository assetRepository;
    private final FaultReportRepository faultReportRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public void reportFault(FaultReportDTO dto) {
        // 1. Find the asset by its serial number
        Asset asset = assetRepository.findBySerialNumber(dto.deviceSerial())
                .orElseThrow(() -> new AssetNotFoundException("Asset not found with serial number: " + dto.deviceSerial()));

        // 2. Update the asset's status to FAULTY
        asset.setStatus(AssetStatus.FAULTY);
        assetRepository.save(asset);

        // 3. Create a new FaultReport ticket
        FaultReport report = new FaultReport();
        report.setAsset(asset);
        report.setFaultType(dto.faultType());
        report.setPriority(dto.priority());
        report.setDescription(dto.description());
        report.setReportedDate(dto.reportedDate());
        report.setStatus("OPEN"); // Set initial status
        report.setReporterUserId(dto.operatorId()); // Log who reported it

        faultReportRepository.save(report);

        // 4. Log this action to the AuditLog
        String description = "Fault reported for Asset " + asset.getSerialNumber() +
                " (ID: " + asset.getId() + "). Type: " + dto.faultType() +
                ", Priority: " + dto.priority();
        auditLogService.logAction("FAULT_REPORTED", description, dto.operatorId());
    }
}