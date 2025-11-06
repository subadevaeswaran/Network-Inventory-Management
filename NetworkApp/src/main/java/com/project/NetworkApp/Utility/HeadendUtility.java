package com.project.NetworkApp.Utility;

// package com.project.NetworkApp.util;
import com.project.NetworkApp.DTO.HeadendDTO;
import com.project.NetworkApp.entity.Headend;
public final class HeadendUtility {
    private HeadendUtility() {}
    public static HeadendDTO toDTO(Headend headend) {
        if (headend == null) return null;
        return new HeadendDTO(headend.getId(), headend.getName(), headend.getCity());
    }
}