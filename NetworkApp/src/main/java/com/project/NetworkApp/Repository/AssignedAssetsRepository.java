package com.project.NetworkApp.Repository;



import com.project.NetworkApp.entity.AssignedAssets;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for the AssignedAssets join table entity.
 * Provides standard CRUD operations.
 */
@Repository
public interface AssignedAssetsRepository extends JpaRepository<AssignedAssets, Integer> {
    // You can add custom query methods here later if needed, for example:
    // List<AssignedAssets> findByCustomerId(Integer customerId);
    // List<AssignedAssets> findByAssetId(Integer assetId);
    List<AssignedAssets> findByCustomer_Id(Integer customerId);

    Optional<AssignedAssets> findByAsset_Id(Integer assetId);
}
