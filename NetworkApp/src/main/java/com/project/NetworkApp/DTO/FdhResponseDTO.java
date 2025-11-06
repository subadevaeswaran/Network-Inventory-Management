package com.project.NetworkApp.DTO;

// FdhResponseDTO.java

// DTO for returning FDH details
public record FdhResponseDTO(
        Integer id,
        String name,
        String location,
        String region,
        int maxPorts,
        Integer headendId // ID of the parent Headend
) {}