package com.project.NetworkApp.DTO;

public record SplitterCreateDTO(
        String model,         // e.g., "1:8 SC/APC"
        int portCapacity,   // e.g., 8, 16
        String location,      // e.g., "Pole 101, Oak St"
        Integer fdhId         // ID of the parent FDH
) {}