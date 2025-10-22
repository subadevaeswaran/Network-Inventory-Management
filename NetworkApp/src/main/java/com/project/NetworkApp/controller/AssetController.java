package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.AssetResponseDTO;
import com.project.NetworkApp.Service.AssetService;
import com.project.NetworkApp.enums.AssetType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assets")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class AssetController {
    // ... (existing service & endpoints)

    private final AssetService assetService;

    @GetMapping("/available")
    public ResponseEntity<List<AssetResponseDTO>> getAvailableAssets(@RequestParam AssetType type) {
        return ResponseEntity.ok(assetService.getAvailableAssetsByType(type));
    }
}