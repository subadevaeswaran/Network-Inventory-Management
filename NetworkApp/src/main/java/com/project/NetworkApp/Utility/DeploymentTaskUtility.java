package com.project.NetworkApp.Utility;



import com.project.NetworkApp.DTO.DeploymentTaskDTO;
import com.project.NetworkApp.entity.Customer;
import com.project.NetworkApp.entity.DeploymentTask;
import com.project.NetworkApp.entity.Technician;

/**
 * Utility class to map between DeploymentTask entities and DTOs.
 */
public final class DeploymentTaskUtility {

    /**
     * Private constructor to prevent instantiation.
     */
    private DeploymentTaskUtility() {}

    /**
     * Converts a DeploymentTask entity to a DeploymentTaskDTO.
     * Safely handles potentially null related entities (Customer, Technician).
     * @param task The DeploymentTask entity.
     * @return The resulting DeploymentTaskDTO.
     */
    public static DeploymentTaskDTO toDTO(DeploymentTask task) {
        if (task == null) {
            return null;
        }

        Customer customer = task.getCustomer(); // Get related customer (might be null if relationship isn't loaded or set)
        Technician technician = task.getTechnician(); // Get related technician (might be null)

        return new DeploymentTaskDTO(
                task.getId(),
                customer != null ? customer.getId() : null, // Safely get customer ID
                customer != null ? customer.getName() : "N/A", // Safely get customer name
                customer != null ? customer.getAddress() : "N/A", // Safely get customer address
                technician != null ? technician.getId() : null, // Safely get technician ID
                task.getStatus(),
                task.getScheduledDate(),
                task.getNotes()
        );
    }

    // No toEntity method is typically needed for basic task display/completion,
    // as tasks are usually created based on specific actions (like assignment).
    // If you need to create/update tasks via DTO later, add a toEntity method here.
}
