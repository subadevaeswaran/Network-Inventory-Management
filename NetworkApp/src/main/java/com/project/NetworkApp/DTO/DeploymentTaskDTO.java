package com.project.NetworkApp.DTO;



import com.project.NetworkApp.enums.TaskStatus;
import java.time.LocalDate;

/**
 * DTO for transferring DeploymentTask data, often used for lists or summaries.
 */
public record DeploymentTaskDTO(
        Integer id,
        Integer customerId,
        String customerName,
        String customerAddress,
        Integer technicianId,
        String technicianName, // <-- ADD THIS
        TaskStatus status,
        String priority,       // <-- ADD THIS
        LocalDate scheduledDate,
        String notes            // Notes related to the task
) {}
