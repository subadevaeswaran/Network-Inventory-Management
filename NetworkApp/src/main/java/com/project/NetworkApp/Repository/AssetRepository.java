package com.project.NetworkApp.Repository;



import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Integer> {
    // ... (existing methods)

    Optional<Asset> findBySerialNumber(String serialNumber);

    List<Asset> findByAssetType(AssetType assetType);

    List<Asset> findByStatus(AssetStatus status);
    // This query finds assets of a specific type and status

    @Query("SELECT a FROM Asset a WHERE " +
            "(:assetType IS NULL OR a.assetType = :assetType) AND " +
            "(:assetStatus IS NULL OR a.status = :assetStatus)")
    List<Asset> findAssetsByCriteria(
            @Param("assetType") AssetType assetType,
            @Param("assetStatus") AssetStatus assetStatus
    );
    List<Asset> findByAssetTypeAndStatus(AssetType assetType, AssetStatus status);

    Optional<Asset> findByAssetTypeAndRelatedEntityId(AssetType assetType, Integer relatedEntityId);

    long countByStatus(AssetStatus status);

    List<Asset> findBySerialNumberContainingIgnoreCaseAndStatusAndAssetTypeIn(
            String serialNumberQuery,
            AssetStatus status,
            List<AssetType> types
    );
}