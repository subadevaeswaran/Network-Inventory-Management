package com.project.NetworkApp.DTO;

// package com.project.NetworkApp.dto;

import com.project.NetworkApp.enums.UserRole;

/**
 * DTO for safely responding with user data (no password).
 */
public record UserResponseDTO(
        Integer id,
        String username,
        UserRole role,
        java.time.LocalDateTime lastLogin
) {
}