package com.project.NetworkApp.DTO;

import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;

public record AssetCreateDTO(
        AssetType assetType,
        String model,
        String serialNumber,
        AssetStatus status, // Typically 'AVAILABLE' when creating
        String location // E.g., 'Warehouse A'
) {
}