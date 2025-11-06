package com.project.NetworkApp.DTO;

public record SplitterResponseDTO(
        Integer id,
        String model,
        int portCapacity,
        int usedPorts, // Include used ports
        String location,
        Integer fdhId // ID of the parent FDH
) {}
