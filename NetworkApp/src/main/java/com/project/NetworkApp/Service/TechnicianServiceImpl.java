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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicianServiceImpl implements TechnicianService { // Ensure this implements TechnicianService

    private final TechnicianRepository technicianRepository;

    @Override
    public List<TechnicianDTO> getTechnicians(String region) {
        List<Technician> technicians;
        if (StringUtils.hasText(region)) {
            System.out.println(">>> Service: Fetching Technicians for region: " + region); // Add log
            technicians = technicianRepository.findByRegion(region);
        } else {
            System.out.println(">>> Service: Fetching ALL Technicians"); // Add log
            technicians = technicianRepository.findAll();
        }
        System.out.println(">>> Service: Found " + technicians.size() + " technicians."); // Add log
        // Map the list of entities to a list of DTOs
        return technicians.stream()
                .map(TechnicianUtility::toDTO) // Use the utility mapper
                .collect(Collectors.toList());
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