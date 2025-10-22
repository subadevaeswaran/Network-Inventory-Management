package com.project.NetworkApp.Repository;

// package com.example.inventory.repository;

import com.project.NetworkApp.entity.Splitter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SplitterRepository extends JpaRepository<Splitter, Integer> {

    List<Splitter> findByFdhId(Integer fdhId);
    // You can add custom query methods here later if needed
}