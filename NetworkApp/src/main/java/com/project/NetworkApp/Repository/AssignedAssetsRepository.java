package com.project.NetworkApp.Repository;



import com.project.NetworkApp.entity.AssignedAssets;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface AssignedAssetsRepository extends JpaRepository<AssignedAssets, Integer> {

    List<AssignedAssets> findByCustomer_Id(Integer customerId);

    Optional<AssignedAssets> findByAsset_Id(Integer assetId);
}
