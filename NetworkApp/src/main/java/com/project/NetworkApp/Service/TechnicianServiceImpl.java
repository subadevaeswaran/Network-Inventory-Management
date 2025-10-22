package com.project.NetworkApp.Service; // Corrected package case

import com.project.NetworkApp.DTO.TechnicianDTO;
import com.project.NetworkApp.Repository.TechnicianRepository;
import com.project.NetworkApp.Utility.TechnicianUtility; // Ensure this utility exists and works
import com.project.NetworkApp.entity.Technician;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TechnicianServiceImpl implements TechnicianService { // Ensure this implements TechnicianService

    private final TechnicianRepository technicianRepository;

    @Override
    public List<Technician> getTechnicians(String region) {
        if (StringUtils.hasText(region)) {
            return technicianRepository.findByRegion(region);
        } else {
            return technicianRepository.findAll();
        }
    }

    // --- FIX 1: Change return type to Optional<TechnicianDTO> ---
    @Override
    public Optional<TechnicianDTO> getTechnicianByUserId(Integer userId) {
        System.out.println(">>> Service: Searching for Technician by User ID: " + userId);
        try {
            // --- FIX 2: Ensure correct repository method name ---
            Optional<Technician> technicianOpt = technicianRepository.findByUser_Id(userId);
            System.out.println(">>> Service: Found technician entity? " + technicianOpt.isPresent());

            // Map the entity Optional to a DTO Optional
            return technicianOpt.map(TechnicianUtility::toDTO); // This now matches the return type

        } catch (Exception e) {
            System.err.println("!!! Service ERROR finding technician by User ID: " + userId);
            e.printStackTrace(); // Log the error
            return Optional.empty(); // Return empty on error
        }
    }
}