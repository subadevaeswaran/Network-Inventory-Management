package com.project.NetworkApp.Utility;

import com.project.NetworkApp.DTO.SplitterCreateDTO;
import com.project.NetworkApp.DTO.SplitterResponseDTO;
import com.project.NetworkApp.entity.Fdh;      // Import FDH
import com.project.NetworkApp.entity.Splitter; // Import Splitter

public final class SplitterUtility {

    private SplitterUtility() {}

    public static SplitterResponseDTO toDTO(Splitter splitter) {
        if (splitter == null) return null;
        return new SplitterResponseDTO(
                splitter.getId(),
                splitter.getModel(),
                splitter.getPortCapacity(),
                splitter.getUsedPorts(),
                splitter.getLocation(),
                splitter.getFdh() != null ? splitter.getFdh().getId() : null // Safely get FDH ID
        );
    }

    // Need FDH entity to link during creation
    public static Splitter toEntity(SplitterCreateDTO dto, Fdh fdh) {
        if (dto == null) return null;
        Splitter splitter = new Splitter();
        splitter.setModel(dto.model());
        splitter.setPortCapacity(dto.portCapacity());
        splitter.setLocation(dto.location());
        splitter.setUsedPorts(0); // New splitters start with 0 used ports
        splitter.setFdh(fdh);     // Link the parent FDH entity
        return splitter;
    }
}