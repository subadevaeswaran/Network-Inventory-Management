package com.project.NetworkApp.DTO;

// package com.project.NetworkApp.dto;

import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import java.time.LocalDateTime;

/**
 * DTO for safely responding with Asset data.
 */
public record AssetResponseDTO(
        Integer id,
        AssetType assetType,
        String model,
        String serialNumber,
        AssetStatus status,
        String location,
        Integer assignedToCustomerId,
        LocalDateTime assignedDate,
        Integer relatedEntityId
) {
}