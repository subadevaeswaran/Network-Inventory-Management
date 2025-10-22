package com.project.NetworkApp.Repository;

// package com.project.NetworkApp.repository;
// ... imports
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Integer> {
    // ... (existing methods)

    // This query finds assets of a specific type and status
    List<Asset> findByAssetTypeAndStatus(AssetType assetType, AssetStatus status);
}