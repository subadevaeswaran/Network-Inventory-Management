package com.project.NetworkApp.DTO;

// FdhCreateDTO.java

// DTO for creating a new FDH
public record FdhCreateDTO(
        String name,
        String location,
        String region,     // The neighborhood
        int maxPorts,
        Integer headendId // ID of the parent Headend
) {}