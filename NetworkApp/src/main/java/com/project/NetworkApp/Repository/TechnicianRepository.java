package com.project.NetworkApp.Repository;


import com.project.NetworkApp.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Import List
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Integer> {
    // --- ADD THIS METHOD ---
    List<Technician> findByRegion(String region);

    Optional<Technician> findByUser_Id(Integer userId);
}