package com.project.NetworkApp.DTO;

import com.project.NetworkApp.enums.UserRole;

public record UserResponseDetails(
        Integer id,
        String username,
        UserRole role
) {}
