package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;
import com.project.NetworkApp.DTO.SplitterCreateDTO;
import com.project.NetworkApp.DTO.SplitterResponseDTO;
import com.project.NetworkApp.Repository.AssetRepository;
import com.project.NetworkApp.Repository.FdhRepository;
import com.project.NetworkApp.Utility.SplitterUtility;
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.entity.Fdh;
import com.project.NetworkApp.entity.Splitter;
import com.project.NetworkApp.Repository.SplitterRepository;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SplitterServiceImpl implements SplitterService {

    @Autowired
    private  SplitterRepository splitterRepository;
    private final FdhRepository fdhRepository;         // <-- Inject FDH Repo
    private final AssetRepository assetRepository;

    @Override
    @Transactional
    public SplitterResponseDTO createSplitter(SplitterCreateDTO splitterCreateDTO) {
        // 1. Find the parent FDH
        Fdh fdh = fdhRepository.findById(splitterCreateDTO.fdhId())
                .orElseThrow(() -> new EntityNotFoundException("Parent FDH not found with ID: " + splitterCreateDTO.fdhId()));

        // 2. Convert DTO to Splitter Entity and save it
        Splitter newSplitter = SplitterUtility.toEntity(splitterCreateDTO, fdh);
        // Optional: Add validation (e.g., check if model/location combo exists under this FDH)
        Splitter savedSplitter = splitterRepository.save(newSplitter);

        // 3. Create and save the corresponding Asset entity
        Asset assetRecord = new Asset();
        assetRecord.setAssetType(AssetType.SPLITTER);
        // Generate a unique serial number (e.g., FDHName-SplitterModel-ID)
        // For simplicity, using model + ID for now. Needs a better strategy for uniqueness.
        String serial = (fdh.getName() != null ? fdh.getName() + "-" : "") +
                savedSplitter.getModel() + "-" + savedSplitter.getId();
        assetRecord.setSerialNumber(serial); // Use a generated or user-provided serial
        assetRecord.setModel(savedSplitter.getModel());
        assetRecord.setLocation(savedSplitter.getLocation());
        // Splitters are typically 'Assigned'/'Installed' immediately within an FDH
        assetRecord.setStatus(AssetStatus.AVAILABLE);
        assetRecord.setRelatedEntityId(savedSplitter.getId());
        assetRepository.save(assetRecord); // Save the Asset record

        // 4. Convert saved Splitter Entity back to DTO
        return SplitterUtility.toDTO(savedSplitter);
    }
    @Override
    public List<SplitterResponseDTO> getSplittersByFdh(Integer fdhId) {
        List<Splitter> splitters = splitterRepository.findByFdhId(fdhId);

        // 2. Map Entities to DTOs using Utility
        return splitters.stream()
                .map(SplitterUtility::toDTO)
                .collect(Collectors.toList());
    }
}

