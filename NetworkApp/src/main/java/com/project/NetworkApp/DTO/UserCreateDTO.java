package com.project.NetworkApp.DTO;

// package com.project.NetworkApp.dto;

import com.project.NetworkApp.enums.UserRole;

/**
 * DTO for creating a new user.
 */
public record UserCreateDTO(
        String username,
        String password, // Plain-text password from the client
        UserRole role
) {
}