package com.project.NetworkApp.Repository;

// package com.project.NetworkApp.repository;

import com.project.NetworkApp.entity.Fdh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- Import Query
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FdhRepository extends JpaRepository<Fdh, Integer> {

    // This query selects all unique, non-null region values from the Fdh table
    @Query("SELECT DISTINCT f.region FROM Fdh f WHERE f.region IS NOT NULL")
    List<String> findDistinctRegions();

    @Query("SELECT DISTINCT f.region FROM Fdh f WHERE f.headend.city = :city AND f.region IS NOT NULL")
    List<String> findDistinctRegionsByCity(@Param("city") String city);

    List<Fdh> findByHeadendCity(String city);

    List<Fdh> findByRegion(String region);
}