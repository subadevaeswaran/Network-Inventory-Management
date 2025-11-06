package com.project.NetworkApp.DTO;

import java.time.LocalDate;

public record FaultyDeviceSwapDTO(
        Integer faultyAssetId,     // The ID of the asset being marked as FAULTY
        Integer replacementAssetId,  // The ID of the AVAILABLE asset that is replacing it
        String faultType,
        String priority,
        String description,
        LocalDate reportedDate,
        Integer operatorId           // The ID of the user performing the swap
) {}