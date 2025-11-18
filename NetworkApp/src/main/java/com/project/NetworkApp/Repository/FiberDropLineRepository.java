package com.project.NetworkApp.Repository;


import com.project.NetworkApp.entity.FiberDropLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FiberDropLineRepository extends JpaRepository<FiberDropLine, Integer> {
    // Add custom queries if needed later
}