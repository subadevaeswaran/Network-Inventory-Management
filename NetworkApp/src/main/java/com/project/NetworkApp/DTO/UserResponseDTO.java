package com.project.NetworkApp.DTO;

import com.project.NetworkApp.enums.UserRole;

public record UserResponseDTO(
        Integer id,
        String username,
        UserRole role,
        java.time.LocalDateTime lastLogin
) {
}