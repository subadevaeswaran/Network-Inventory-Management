package com.project.NetworkApp.Utility;


import com.project.NetworkApp.DTO.AssignedAssetsResponseDTO;
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.entity.AssignedAssets;

public final class AssignedAssetsUtility {
    private AssignedAssetsUtility() {}

    public static AssignedAssetsResponseDTO toDTO(AssignedAssets assignedAsset) {
        if (assignedAsset == null) return null;
        Asset asset = assignedAsset.getAsset(); // Get the related Asset

        return new AssignedAssetsResponseDTO(
                assignedAsset.getId(),
                asset != null ? asset.getId() : null,
                asset != null ? asset.getSerialNumber() : "N/A",
                asset != null ? asset.getModel() : "N/A",
                asset != null ? asset.getAssetType() : null
        );
    }
}