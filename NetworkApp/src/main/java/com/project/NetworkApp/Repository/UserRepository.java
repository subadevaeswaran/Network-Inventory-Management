package com.project.NetworkApp.Repository;

// package com.project.NetworkApp.repository;

import com.project.NetworkApp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // This will be needed for the login page
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email); // <-- ADD THIS LINE
}
