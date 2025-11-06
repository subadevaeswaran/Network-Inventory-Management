package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.AuditLogResponseDTO;
import com.project.NetworkApp.entity.User; // Assuming you can get the logged-in user

import java.util.List;

public interface AuditLogService {

    /**
     * Creates a new audit log entry.
     * @param actionType A code representing the action (e.g., "CUSTOMER_CREATE").
     * @param description A detailed description of the event.
     * @param userId The ID of the user performing the action (can be null for system actions).
     */
    void logAction(String actionType, String description, Integer userId);

    // Overloaded method if you have the User object
    void logAction(String actionType, String description, User user);
    List<AuditLogResponseDTO> getAllLogs();
}

