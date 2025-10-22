package com.project.NetworkApp.Utility;



import com.project.NetworkApp.DTO.TechnicianDTO;
import com.project.NetworkApp.entity.Technician;
import com.project.NetworkApp.entity.User; // Import User

public final class TechnicianUtility {

    private TechnicianUtility() {}

    public static TechnicianDTO toDTO(Technician technician) {
        if (technician == null) {
            return null;
        }
        User user = technician.getUser(); // Get the associated User object
        return new TechnicianDTO(
                technician.getId(),
                technician.getName(),
                technician.getContact(),
                technician.getRegion(),
                user != null ? user.getId() : null // Safely get the user's ID
        );
    }

    // No toEntity needed for this specific use case yet
}
