package com.project.NetworkApp.Service;



import com.project.NetworkApp.DTO.FdhCreateDTO;
import com.project.NetworkApp.DTO.FdhResponseDTO;
import com.project.NetworkApp.Repository.AssetRepository;
import com.project.NetworkApp.Repository.FdhRepository;
import com.project.NetworkApp.Repository.HeadendRepository;
import com.project.NetworkApp.Utility.FdhUtility;
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.entity.Fdh;
import com.project.NetworkApp.entity.Headend;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import com.project.NetworkApp.exception.AssetNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FdhServiceImpl implements FdhService {

    private final   FdhRepository fdhRepository;
    private final HeadendRepository headendRepository;
    private final AssetRepository assetRepository;

    private static final Logger log = LoggerFactory.getLogger(FdhServiceImpl.class);


    @Override
    public List<String> getDistinctRegions() {
        return fdhRepository.findDistinctRegions();
    }

    @Override
    public List<String> getRegionsByCity(String city) {
       log.info(">>> Service: Fetching Regions for city: {}" , city); // Add Log
        List<String> regions = fdhRepository.findDistinctRegionsByCity(city); // Calls the specific query
        log.info("Service: Found {} regions for city {}", regions.size(), city);
        return regions;
    }

    @Override
    public List<FdhResponseDTO> getFdhsByCity(String city) {
        log.info(">>> Service: Fetching FDHs for city: {}" , city); // Add Log
        // Ensure it calls findByHeadend_City
        List<Fdh> fdhs = fdhRepository.findByHeadend_City(city);
        log.info("Service: Found {} FDH entities for city {}", fdhs.size(), city);
        // Map entities to DTOs
        return fdhs.stream()
                .map(FdhUtility::toDTO)
                .toList();
    }

    @Override
    public List<Fdh> getFdhsByRegion(String region) {
        return fdhRepository.findByRegion(region);
    }

    @Override
    @Transactional // Ensures both saves happen or neither does
    public FdhResponseDTO createFdh(FdhCreateDTO fdhCreateDTO) {
        // 1. Find the parent Headend
        Headend headend = headendRepository.findById(fdhCreateDTO.headendId())
                .orElseThrow(() -> new AssetNotFoundException("Parent Headend not found with ID: " + fdhCreateDTO.headendId()));

        // 2. Convert DTO to FDH Entity and save it
        Fdh newFdh = FdhUtility.toEntity(fdhCreateDTO, headend);
        Fdh savedFdh = fdhRepository.save(newFdh); // Save FDH first to get its ID if needed


        // 3. Create and save the corresponding Asset entity
        Asset assetRecord = new Asset();
        assetRecord.setAssetType(AssetType.FDH); // Set the type
        // Use FDH name as the unique identifier (serial number) for Asset
        assetRecord.setSerialNumber(savedFdh.getName());
        // Set a default model or potentially add a model field to FdhCreateDTO
        assetRecord.setModel(savedFdh.getMaxPorts() + "-Port FDH"); // Example model
        assetRecord.setLocation(savedFdh.getLocation()); // Copy location
        // FDHs are typically 'Assigned' or 'Installed' immediately
        assetRecord.setStatus(AssetStatus.AVAILABLE);
        assetRecord.setRelatedEntityId(savedFdh.getId());
        // We don't link Asset back to FDH entity directly here,
        // but the serialNumber (FDH name) provides the link.

        // Optional: Check if an asset with this serial already exists
        assetRepository.findBySerialNumber(assetRecord.getSerialNumber())
                .ifPresent(existing -> log.warn(
                        "Asset record with serial number (FDH name) {} already exists.",
                        assetRecord.getSerialNumber()));



        assetRepository.save(assetRecord); // Save the Asset record
        // -----------------------

        // 4. Convert saved FDH Entity back to DTO
        return FdhUtility.toDTO(savedFdh);
    }

    @Override
    public List<Fdh> getFdhsByCityAndRegion(String city, String region) {
        log.info("Service: Fetching FDHs for city: {}, region: {}", city, region);
        // Use the updated repository method
        List<Fdh> results = fdhRepository.findByHeadend_CityAndRegion(city, region);
        log.info("Service: Found {} FDHs for the given criteria.", results.size());
        return results;
    }
}
