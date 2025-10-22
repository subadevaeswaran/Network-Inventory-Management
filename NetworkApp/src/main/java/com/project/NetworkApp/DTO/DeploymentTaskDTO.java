package com.project.NetworkApp.DTO;



import com.project.NetworkApp.enums.TaskStatus;
import java.time.LocalDate;

/**
 * DTO for transferring DeploymentTask data, often used for lists or summaries.
 */
public record DeploymentTaskDTO(
        Integer id,              // Task ID
        Integer customerId,      // ID of the associated customer
        String customerName,     // Customer's name for display
        String customerAddress,  // Customer's address for display
        Integer technicianId,    // ID of the assigned technician
        TaskStatus status,       // Current status of the task
        LocalDate scheduledDate, // Date the task is scheduled for
        String notes             // Notes related to the task
) {}
