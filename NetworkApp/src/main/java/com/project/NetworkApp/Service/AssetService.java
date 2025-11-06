package com.project.NetworkApp.Service;


// ... imports
import com.project.NetworkApp.DTO.AssetCreateDTO;
import com.project.NetworkApp.DTO.AssetResponseDTO;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import java.util.List;

public interface AssetService {
    // ... (existing methods)

    AssetResponseDTO createAsset(AssetCreateDTO assetCreateDTO);
    AssetResponseDTO getAssetById(Integer id);
    List<AssetResponseDTO> getAllAssets(); // Keep this for simpler cases
    List<AssetResponseDTO> getAvailableAssetsByType(AssetType assetType);

    List<AssetResponseDTO> findAssets(AssetType type, AssetStatus status);

    void deleteAsset(Integer assetId);

    AssetResponseDTO findSwappableDeviceBySerial(String serial);

    List<AssetResponseDTO> searchSwappableDevices(String serialQuery);
}
