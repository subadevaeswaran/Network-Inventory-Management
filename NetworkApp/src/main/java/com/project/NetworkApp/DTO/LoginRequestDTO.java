package com.project.NetworkApp.DTO;

// package com.project.NetworkApp.dto;

import com.project.NetworkApp.enums.UserRole;

public record LoginRequestDTO(
        String username,
        String password,
        UserRole role
) {
}