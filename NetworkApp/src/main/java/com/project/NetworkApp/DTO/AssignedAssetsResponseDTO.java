package com.project.NetworkApp.DTO;

import com.project.NetworkApp.enums.AssetType; // Import AssetType

// DTO to return details about an asset assigned to a customer
public record AssignedAssetsResponseDTO(
        Integer assignedAssetId, // ID of the link in assigned_assets table
        Integer assetId,         // ID of the actual Asset
        String serialNumber,     // Asset's serial number
        String model,            // Asset's model
        AssetType assetType      // Type (ONT, ROUTER)
) {}