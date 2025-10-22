package com.project.NetworkApp.DTO;



// DTO for returning Technician information
public record TechnicianDTO(
        Integer id,
        String name,
        String contact,
        String region,
        Integer userId // Include the user ID from the associated User
) {}