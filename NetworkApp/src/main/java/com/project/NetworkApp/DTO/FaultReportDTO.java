package com.project.NetworkApp.DTO;


import java.time.LocalDate;

// DTO to receive the fault report from the frontend
public record FaultReportDTO(
        String deviceSerial, // Serial number to find the asset
        String faultType,
        String priority,
        String description,
        LocalDate reportedDate,
        Integer operatorId // The ID of the user reporting the fault (can be null)
) {}
