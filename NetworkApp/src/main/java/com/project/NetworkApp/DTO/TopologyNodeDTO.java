package com.project.NetworkApp.DTO;

import java.util.List;
import java.util.Map;

public record TopologyNodeDTO(
        String id,         // Unique identifier (e.g., "headend-1", "fdh-5", "splitter-12")
        String type,       // "Headend", "FDH", "Splitter"
        String name,       // Display name (e.g., "Main Headend", "FDH-A1", "SPL-8-A1.1")
        List<String> children, // List of child node IDs
        Map<String, String> details // Optional map for extra details (e.g., ports, ratio)
) {}