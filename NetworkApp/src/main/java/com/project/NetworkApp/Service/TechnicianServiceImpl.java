package com.project.NetworkApp.Service; // Corrected package case

import com.project.NetworkApp.DTO.TechnicianDTO;
import com.project.NetworkApp.Repository.TechnicianRepository;
import com.project.NetworkApp.Utility.TechnicianUtility; // Ensure this utility exists and works
import com.project.NetworkApp.entity.Technician;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class TechnicianServiceImpl implements TechnicianService {

    private final TechnicianRepository technicianRepository;

    private static final Logger log = LoggerFactory.getLogger(TechnicianServiceImpl.class);


    @Override
    public List<TechnicianDTO> getTechnicians(String region) {
        List<Technician> technicians;
        if (StringUtils.hasText(region)) {
            log.info(">>> Service: Fetching Technicians for region: {}", region); // Add log
            technicians = technicianRepository.findByRegion(region);
        } else {
            log.info(">>> Service: Fetching ALL Technicians"); // Add log
            technicians = technicianRepository.findAll();
        }

        // Map the list of entities to a list of DTOs
        return technicians.stream()
                .map(TechnicianUtility::toDTO) // Use the utility mapper
                .toList();
    }

    // --- FIX 1: Change return type to Optional<TechnicianDTO> ---
    @Override
    public Optional<TechnicianDTO> getTechnicianByUserId(Integer userId) {
        log.info(">>> Service: Searching for Technician by User ID: {}" ,userId);
        try {
            // --- FIX 2: Ensure correct repository method name ---
            Optional<Technician> technicianOpt = technicianRepository.findByUser_Id(userId);
            log.info(">>> Service: Found technician entity: {} " , technicianOpt.isPresent());

            // Map the entity Optional to a DTO Optional
            return technicianOpt.map(TechnicianUtility::toDTO); // This now matches the return type

        } catch (Exception e) {
            log.error("!!! Service ERROR finding technician by User ID: {}" , userId);
            // Log the error
            return Optional.empty(); // Return empty on error
        }
    }
}