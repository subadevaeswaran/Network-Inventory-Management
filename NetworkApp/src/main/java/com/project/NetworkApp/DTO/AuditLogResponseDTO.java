package com.project.NetworkApp.DTO;

import com.project.NetworkApp.enums.UserRole;

import java.time.LocalDateTime;

public record AuditLogResponseDTO(
        Long id,
        LocalDateTime timestamp,
        Integer userId,        // ID of the user who performed action
        String username,
        UserRole userRole,// Username (fetched via join or separate query)
        String actionType,     // e.g., CUSTOMER_CREATE
        String resourceType,   // e.g., Customer (You might add this field to AuditLog entity)
        String resourceId,     // e.g., 13 (You might add this field to AuditLog entity)
        String description     // Detailed log message
) {}
