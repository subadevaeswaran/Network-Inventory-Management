package com.project.NetworkApp.Utility;


import com.project.NetworkApp.DTO.AssetCreateDTO;
import com.project.NetworkApp.DTO.AssetResponseDTO;
import com.project.NetworkApp.entity.Asset;

/**
 * Utility class to map between Asset entities and DTOs.
 */
public final class AssetUtility {

    /**
     * Private constructor to prevent instantiation.
     */
    private AssetUtility() {}

    /**
     * Converts an Asset entity to an AssetResponseDTO.
     * @param asset The Asset entity to convert.
     * @return The resulting AssetResponseDTO.
     */
    public static AssetResponseDTO toDTO(Asset asset) {
        if (asset == null) {
            return null;
        }
        return new AssetResponseDTO(
                asset.getId(),
                asset.getAssetType(),
                asset.getModel(),
                asset.getSerialNumber(),
                asset.getStatus(),
                asset.getLocation(),
                asset.getAssignedToCustomerId(),
                asset.getAssignedDate(),
                asset.getRelatedEntityId()
        );
    }

    /**
     * Converts an AssetCreateDTO to an Asset entity.
     * This method does not require any repository dependencies.
     * @param dto The AssetCreateDTO to convert.
     * @return A new Asset entity (not yet saved).
     */
    public static Asset toEntity(AssetCreateDTO dto) {
        if (dto == null) {
            return null;
        }
        Asset asset = new Asset();
        asset.setAssetType(dto.assetType());
        asset.setModel(dto.model());
        asset.setSerialNumber(dto.serialNumber());
        asset.setStatus(dto.status());
        asset.setLocation(dto.location());
        // Fields like assignedToCustomerId and assignedDate are set later
        // when the asset is actually assigned.
        return asset;
    }
}