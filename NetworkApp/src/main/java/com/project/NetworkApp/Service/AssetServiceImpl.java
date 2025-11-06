package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.AssetCreateDTO;
import com.project.NetworkApp.DTO.AssetResponseDTO;
import com.project.NetworkApp.Repository.AssetRepository;
import com.project.NetworkApp.Repository.CustomerRepository;
import com.project.NetworkApp.Repository.FdhRepository;
import com.project.NetworkApp.Repository.SplitterRepository;
import com.project.NetworkApp.Utility.AssetUtility; // Ensure utility is imported
import com.project.NetworkApp.entity.Asset;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import jakarta.persistence.EntityNotFoundException; // For error handling
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Optional for read-only methods

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;

    private final SplitterRepository splitterRepository;
    private final FdhRepository fdhRepository; // Inject FDH Repo
    private final CustomerRepository customerRepository;

    @Override
    @Transactional // Good practice for create/update/delete operations
    public AssetResponseDTO createAsset(AssetCreateDTO assetCreateDTO) {
        // Optional: Check if serial number already exists to prevent duplicates
        assetRepository.findBySerialNumber(assetCreateDTO.serialNumber()).ifPresent(existing -> {
            throw new IllegalArgumentException("Asset with serial number " + assetCreateDTO.serialNumber() + " already exists.");
        });

        Asset newAsset = AssetUtility.toEntity(assetCreateDTO);
        // Ensure new assets are marked as AVAILABLE by default if not specified
        if (newAsset.getStatus() == null) {
            newAsset.setStatus(AssetStatus.AVAILABLE);
        }
        Asset savedAsset = assetRepository.save(newAsset);
        return AssetUtility.toDTO(savedAsset);
    }

    @Override
    @Transactional(readOnly = true) // Optimize for read operations
    public AssetResponseDTO getAssetById(Integer id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found with id: " + id));
        return AssetUtility.toDTO(asset);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponseDTO> getAllAssets() {
        return assetRepository.findAll().stream()
                .map(AssetUtility::toDTO).toList();
                //.collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponseDTO> getAvailableAssetsByType(AssetType assetType) {
        List<Asset> assets = assetRepository.findByAssetTypeAndStatus(assetType, AssetStatus.AVAILABLE);
        return assets.stream()
                .map(AssetUtility::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponseDTO> findAssets(AssetType type, AssetStatus status) {
        // The repository method handles nulls, so we pass them directly
        List<Asset> assets = assetRepository.findAssetsByCriteria(type, status);
        return assets.stream()
                .map(AssetUtility::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional // Ensure atomicity
    public void deleteAsset(Integer assetId) {
        // 1. Find the Asset record
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found with ID: " + assetId));

        // 2. Check if the status allows deletion
        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new IllegalStateException("Cannot delete asset with status '" + asset.getStatus() + "'. Only 'AVAILABLE' assets can be deleted.");
        }

        // 3. Handle deletion of associated infrastructure entities (if applicable)
        String deletedInfraType = null; // To track what else was deleted

        if (asset.getAssetType() == AssetType.SPLITTER) {
            Integer splitterId = asset.getRelatedEntityId();
            if (splitterId != null) {
                // Check if splitter exists (should normally)
                if (!splitterRepository.existsById(splitterId)) {
                    System.err.println("Warning: Associated Splitter with ID " + splitterId + " not found for Asset " + assetId + ". Deleting Asset record only.");
                } else {
                    // Check for dependencies (customers)
                    long customerCount = customerRepository.countBySplitter_Id(splitterId);
                    if (customerCount > 0) {
                        throw new DataIntegrityViolationException("Cannot delete Splitter " + splitterId + " as it has " + customerCount + " customers assigned.");
                    }
                    // Delete the Splitter entity
                    splitterRepository.deleteById(splitterId);
                    deletedInfraType = "Splitter";
                    System.out.println("Deleted associated Splitter: " + splitterId);
                }
            } else {
                System.err.println("Warning: Asset " + assetId + " is type SPLITTER but has no relatedEntityId. Deleting Asset record only.");
            }
        } else if (asset.getAssetType() == AssetType.FDH) {
            Integer fdhId = asset.getRelatedEntityId();
            if (fdhId != null) {
                if (!fdhRepository.existsById(fdhId)) {
                    System.err.println("Warning: Associated FDH with ID " + fdhId + " not found for Asset " + assetId + ". Deleting Asset record only.");
                } else {
                    // Check for dependencies (splitters)
                    long splitterCount = splitterRepository.countByFdh_Id(fdhId);
                    if (splitterCount > 0) {
                        throw new DataIntegrityViolationException("Cannot delete FDH " + fdhId + " as it has " + splitterCount + " splitters assigned.");
                    }
                    // Delete the FDH entity
                    fdhRepository.deleteById(fdhId);
                    deletedInfraType = "FDH";
                    System.out.println("Deleted associated FDH: " + fdhId);
                }
            } else {
                System.err.println("Warning: Asset " + assetId + " is type FDH but has no relatedEntityId. Deleting Asset record only.");
            }
        }

        // 4. Delete the Asset record itself
        assetRepository.delete(asset);
        System.out.println("Deleted Asset: " + assetId + (deletedInfraType != null ? " (and associated " + deletedInfraType + ")" : ""));
    }

    @Override
    @Transactional(readOnly = true)
    public AssetResponseDTO findSwappableDeviceBySerial(String serial) {
        // 1. Find the asset by serial number
        Asset asset = assetRepository.findBySerialNumber(serial)
                .orElseThrow(() -> new EntityNotFoundException("Asset not found with serial number: " + serial));

        // 2. Check if it's an ONT or ROUTER
        if (asset.getAssetType() != AssetType.ONT && asset.getAssetType() != AssetType.ROUTER) {
            throw new IllegalStateException("Only ONT or ROUTER devices can be reported as faulty. This is a " + asset.getAssetType() + ".");
        }

        // 3. Check if it's currently ASSIGNED
        if (asset.getStatus() != AssetStatus.ASSIGNED) {
            throw new IllegalStateException("Device status is " + asset.getStatus() + ". Only ASSIGNED devices can be reported.");
        }

        // 4. If all checks pass, return the asset DTO
        return AssetUtility.toDTO(asset);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponseDTO> searchSwappableDevices(String serialQuery) {
        // Define the criteria
        AssetStatus requiredStatus = AssetStatus.ASSIGNED;
        List<AssetType> swappableTypes = List.of(AssetType.ONT, AssetType.ROUTER);

        // Call the new repository method
        List<Asset> assets = assetRepository.findBySerialNumberContainingIgnoreCaseAndStatusAndAssetTypeIn(
                serialQuery,
                requiredStatus,
                swappableTypes
        );

        // Map to DTOs
        return assets.stream()
                .map(AssetUtility::toDTO)
                .collect(Collectors.toList());
    }
}