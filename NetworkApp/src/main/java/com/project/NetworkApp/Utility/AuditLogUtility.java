package com.project.NetworkApp.Utility;



import com.project.NetworkApp.DTO.AuditLogResponseDTO;
import com.project.NetworkApp.entity.AuditLog;
import com.project.NetworkApp.entity.User; // Import User if joining/looking up
import com.project.NetworkApp.Repository.UserRepository; // Import if looking up
import com.project.NetworkApp.enums.UserRole;

import java.util.Optional;
import java.util.function.Function; // For username lookup function

public final class AuditLogUtility {

    private AuditLogUtility() {}

    // Maps AuditLog entity to DTO, using a function to get the username
    public static AuditLogResponseDTO toDTO(AuditLog log,UserRepository userRepository) {
        if (log == null) return null;

        String username = "System/Unknown"; // Default
        UserRole userRole = null; // Default role to null
        if (log.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(log.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                username = user.getUsername();
                userRole = user.getRole(); // <-- Get the role from the User entity
            } else {
                username = "User ID: " + log.getUserId() + " (Not Found)";
            }
        }

        // Placeholder for resource type/id - Add these fields to AuditLog entity if needed
        String resourceType = extractResourceType(log.getDescription());
        String resourceId = extractResourceId(log.getDescription());

        return new AuditLogResponseDTO(
                log.getId(),
                log.getTimestamp(),
                log.getUserId(),
                username,
                userRole,
                log.getActionType(),
                resourceType, // Placeholder
                resourceId,   // Placeholder
                log.getDescription()
        );
    }

    // --- Placeholder methods to extract Resource Info (Improve these based on description format) ---
    private static String extractResourceType(String description) {
        if (description == null) return "N/A";
        if (description.contains("Customer")) return "Customer";
        if (description.contains("Asset")) return "Asset";
        if (description.contains("Task")) return "DeploymentTask";
        if (description.contains("Splitter")) return "Splitter";
        if (description.contains("FDH")) return "FDH";
        if (description.contains("User")) return "User";
        return "N/A";
    }

    private static String extractResourceId(String description) {
        if (description == null) return "N/A";
        // Simple extraction based on "(ID: xxx)" pattern - needs refinement
        int idIndex = description.indexOf("(ID: ");
        if (idIndex != -1) {
            int endIndex = description.indexOf(")", idIndex);
            if (endIndex != -1) {
                return description.substring(idIndex + 5, endIndex);
            }
        }
        // Fallback for simple ID numbers (less reliable)
        String[] words = description.split(" ");
        for (String word : words) {
            if (word.matches("\\d+")) { // Check if word is a number
                // Be careful, might match port numbers etc. Needs context.
                // return word;
            }
        }
        return "N/A";
    }
    // ------------------------------------------------------------------------------------------
}