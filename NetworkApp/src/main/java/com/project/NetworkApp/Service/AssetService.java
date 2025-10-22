package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;
// ... imports
import com.project.NetworkApp.DTO.AssetResponseDTO;
import com.project.NetworkApp.enums.AssetType;
import java.util.List;

public interface AssetService {
    // ... (existing methods)
    List<AssetResponseDTO> getAvailableAssetsByType(AssetType assetType);
}
