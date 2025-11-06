package com.project.NetworkApp.Utility;



import com.project.NetworkApp.DTO.FdhCreateDTO;
import com.project.NetworkApp.DTO.FdhResponseDTO;
import com.project.NetworkApp.entity.Fdh;
import com.project.NetworkApp.entity.Headend; // Import Headend

public final class FdhUtility {

    private FdhUtility() {}

    public static FdhResponseDTO toDTO(Fdh fdh) {
        if (fdh == null) return null;
        return new FdhResponseDTO(
                fdh.getId(),
                fdh.getName(),
                fdh.getLocation(),
                fdh.getRegion(),
                fdh.getMaxPorts(),
                fdh.getHeadend() != null ? fdh.getHeadend().getId() : null // Safely get Headend ID
        );
    }

    // Need Headend entity to link during creation
    public static Fdh toEntity(FdhCreateDTO dto, Headend headend) {
        if (dto == null) return null;
        Fdh fdh = new Fdh();
        fdh.setName(dto.name());
        fdh.setLocation(dto.location());
        fdh.setRegion(dto.region());
        fdh.setMaxPorts(dto.maxPorts());
        fdh.setHeadend(headend); // Link the parent Headend entity
        return fdh;
    }
}