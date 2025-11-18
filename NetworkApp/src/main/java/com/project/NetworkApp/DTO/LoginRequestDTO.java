package com.project.NetworkApp.DTO;

import com.project.NetworkApp.enums.UserRole;

public record LoginRequestDTO(
        String username,
        String password,
        UserRole role
) {
}