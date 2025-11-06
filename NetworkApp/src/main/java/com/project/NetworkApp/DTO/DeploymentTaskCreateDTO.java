package com.project.NetworkApp.DTO;

import java.time.LocalDate;

public record DeploymentTaskCreateDTO(
        Integer customerId,
        Integer technicianId,
        String priority,
        LocalDate scheduledDate,
        String notes // This will map to the description
) {}