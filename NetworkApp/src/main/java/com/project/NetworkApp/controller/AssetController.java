package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.AssetCreateDTO;
import com.project.NetworkApp.DTO.AssetResponseDTO;
import com.project.NetworkApp.enums.AssetStatus; // Import enums
import com.project.NetworkApp.enums.AssetType;   // Import enums
import com.project.NetworkApp.Service.AssetService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // Ensure necessary imports

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/assets") // Base path for asset endpoints
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    /**
     * POST /assets : Add new hardware to inventory (ONT, router, etc.)
     */
    @PostMapping
    public ResponseEntity<AssetResponseDTO> createAsset(@RequestBody AssetCreateDTO assetCreateDTO) {
        AssetResponseDTO createdAsset = assetService.createAsset(assetCreateDTO);
        return new ResponseEntity<>(createdAsset, HttpStatus.CREATED); // Return 201 Created
    }

    /**
     * GET /assets/{id} : Get a specific asset by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> getAssetById(@PathVariable Integer id) {
        AssetResponseDTO asset = assetService.getAssetById(id);
        return ResponseEntity.ok(asset);
    }

    /**
     * GET /assets/all : Get a list of ALL assets (unfiltered).
     * Note: Added '/all' to distinguish from the filtered endpoint.
     */
    @GetMapping("/all")
    public ResponseEntity<List<AssetResponseDTO>> getAllAssets() {
        List<AssetResponseDTO> assets = assetService.getAllAssets();
        return ResponseEntity.ok(assets);
    }


    /**
     * GET /assets/available : Get available assets filtered by type.
     * Useful for Technician modal.
     */
    @GetMapping("/available")
    public ResponseEntity<List<AssetResponseDTO>> getAvailableAssets(@RequestParam AssetType type) {
        if (type == null) {
            // Or handle differently - maybe return bad request?
            return ResponseEntity.badRequest().build();
        }
        List<AssetResponseDTO> assets = assetService.getAvailableAssetsByType(type);
        return ResponseEntity.ok(assets);
    }

    /**
     * GET /assets : Get a list of assets, optionally filtered by type and/or status.
     * Corresponds to the main inventory view.
     */
    @GetMapping
    public ResponseEntity<List<AssetResponseDTO>> findAssets(
            @RequestParam(required = false) AssetType type, // Optional type filter
            @RequestParam(required = false) AssetStatus status) { // Optional status filter

        // Handle the "ALL" status from frontend by passing null to the service
        AssetStatus queryStatus = null;
        if (status != null && !"ALL".equalsIgnoreCase(status.name())) {
            try {
                // Ensure the status string is a valid enum value, case-insensitive
                queryStatus = AssetStatus.valueOf(status.name().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Handle invalid status string if needed, e.g., return bad request
                System.err.println("Invalid status parameter received: " + status);
                // return ResponseEntity.badRequest().body("Invalid status value");
            }
        }

        List<AssetResponseDTO> assets = assetService.findAssets(type, queryStatus);
        return ResponseEntity.ok(assets);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(@PathVariable Integer id) {
        try {
            assetService.deleteAsset(id);
            return ResponseEntity.noContent().build(); // 204 Success, no body
        } catch (EntityNotFoundException e) {
            // Asset or related infra not found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            // Status was not AVAILABLE
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (DataIntegrityViolationException e) {
            // Dependency violation (e.g., customers on splitter)
            System.err.println("Deletion conflict for asset " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            // Catch-all for unexpected errors
            System.err.println("Unexpected error deleting asset " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred during deletion.");
        }
    }

    @GetMapping("/search-faulty")
    public ResponseEntity<?> findSwappableDevice(@RequestParam String serial) {
        try {
            AssetResponseDTO asset = assetService.findSwappableDeviceBySerial(serial);
            return ResponseEntity.ok(asset);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            // Catches "Not ASSIGNED" or "Not ONT/ROUTER" errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/search-swappable")
    public ResponseEntity<?> searchSwappableDevices(@RequestParam String query) {
        try {
            List<AssetResponseDTO> assets = assetService.searchSwappableDevices(query);
            return ResponseEntity.ok(assets);
        } catch (Exception e) {
            // Handle other potential errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }
}