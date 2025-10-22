package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;
// ... imports
import com.project.NetworkApp.DTO.AssetResponseDTO;
import com.project.NetworkApp.Repository.AssetRepository;
import com.project.NetworkApp.Utility.AssetUtility;
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {


    private final AssetRepository assetRepository;
    @Override
    public List<AssetResponseDTO> getAvailableAssetsByType(AssetType assetType) {
        List<Asset> assets = assetRepository.findByAssetTypeAndStatus(assetType, AssetStatus.AVAILABLE);
        return assets.stream()
                .map(AssetUtility::toDTO)
                .collect(Collectors.toList());
    }
}