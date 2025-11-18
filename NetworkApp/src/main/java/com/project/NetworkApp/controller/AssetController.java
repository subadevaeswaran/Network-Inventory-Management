package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.AssetCreateDTO;
import com.project.NetworkApp.DTO.AssetResponseDTO;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.AssetType;
import com.project.NetworkApp.Service.AssetService;
import com.project.NetworkApp.exception.AssetDeleteException;
import com.project.NetworkApp.exception.AssetNotFoundException;
import com.project.NetworkApp.exception.InvalidAssetException;
import com.project.NetworkApp.exception.InvalidParameterException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;



@RestController
@RequestMapping("/assets")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;
    private static final Logger log = LoggerFactory.getLogger(AssetController.class);

    @PostMapping
    public ResponseEntity<AssetResponseDTO> createAsset(@RequestBody AssetCreateDTO assetCreateDTO) {
        AssetResponseDTO createdAsset = assetService.createAsset(assetCreateDTO);
        return new ResponseEntity<>(createdAsset, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> getAssetById(@PathVariable Integer id) {
        AssetResponseDTO asset = assetService.getAssetById(id);
        return ResponseEntity.ok(asset);
    }

    @GetMapping("/all")
    public ResponseEntity<List<AssetResponseDTO>> getAllAssets() {
        List<AssetResponseDTO> assets = assetService.getAllAssets();
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/available")
    public ResponseEntity<List<AssetResponseDTO>> getAvailableAssets(@RequestParam AssetType type) {
        if (type == null) {

            return ResponseEntity.badRequest().build();
        }
        List<AssetResponseDTO> assets = assetService.getAvailableAssetsByType(type);
        return ResponseEntity.ok(assets);
    }



    @GetMapping
    public ResponseEntity<List<AssetResponseDTO>> findAssets(
            @RequestParam(required = false) AssetType type,
            @RequestParam(required = false) AssetStatus status) {

        AssetStatus queryStatus = null;

        if (status != null && !"ALL".equalsIgnoreCase(status.name())) {
            try {
                queryStatus = AssetStatus.valueOf(status.name().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Instead of handling here, we throw a custom exception
                log.warn("Invalid status parameter received: {}", status);
                throw new InvalidParameterException("Invalid status value: " + status);
            }
        }

        List<AssetResponseDTO> assets = assetService.findAssets(type, queryStatus);
        return ResponseEntity.ok(assets);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAsset(@PathVariable Integer id) {
        try {
            assetService.deleteAsset(id);
            return ResponseEntity.noContent().build();
        } catch (AssetNotFoundException e) {
            log.error("Asset not found for deletion: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AssetDeleteException e) {
            log.warn("Invalid asset state for deletion: {}", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (InvalidAssetException e) {
            log.error("Deletion conflict for asset {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error deleting asset {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred during deletion.");
        }
    }

    @GetMapping("/search-faulty")
    public ResponseEntity<AssetResponseDTO> findSwappableDevice(@RequestParam String serial) {

            AssetResponseDTO asset = assetService.findSwappableDeviceBySerial(serial);
            return ResponseEntity.ok(asset);

    }

    @GetMapping("/search-swappable")
    public ResponseEntity<List<AssetResponseDTO>> searchSwappableDevices(@RequestParam String query) {

            List<AssetResponseDTO> assets = assetService.searchSwappableDevices(query);
            return ResponseEntity.ok(assets);

    }
}