package com.project.NetworkApp.Repository;

// package com.project.NetworkApp.repository;

import com.project.NetworkApp.entity.Headend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HeadendRepository extends JpaRepository<Headend, Integer> {

    @Query("SELECT DISTINCT h.city FROM Headend h WHERE h.city IS NOT NULL")
    List<String> findDistinctCities();

    List<Headend> findByCity(String city);
}