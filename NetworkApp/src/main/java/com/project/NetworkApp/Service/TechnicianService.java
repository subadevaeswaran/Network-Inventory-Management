package com.project.NetworkApp.Service;


import com.project.NetworkApp.DTO.TechnicianDTO;
import com.project.NetworkApp.entity.Technician;
import java.util.List;
import java.util.Optional;

public interface TechnicianService {
    // Modify to accept an optional region
    List<Technician> getTechnicians(String region);

    public Optional<TechnicianDTO> getTechnicianByUserId(Integer userId);
}
