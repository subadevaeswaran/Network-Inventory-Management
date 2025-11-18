package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.FdhCreateDTO;
import com.project.NetworkApp.DTO.FdhResponseDTO;
import com.project.NetworkApp.Service.FdhService;
import com.project.NetworkApp.entity.Fdh;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/fdh")
@CrossOrigin("http://localhost:5173")// Base path for FDH-related endpoints
@RequiredArgsConstructor
public class FdhController {

    private final FdhService fdhService;

    @GetMapping("/regions")
    public ResponseEntity<List<String>> getFdhRegions() {
        List<String> regions = fdhService.getDistinctRegions();
        return ResponseEntity.ok(regions);
    }

    @GetMapping("/regions-by-city")
    public ResponseEntity<List<String>> getRegionsByCity(@RequestParam String city) {
        return ResponseEntity.ok(fdhService.getRegionsByCity(city));
    }

    @GetMapping("/by-city")
    public ResponseEntity<List<FdhResponseDTO>> getFdhsByCity(@RequestParam String city) {
        List<FdhResponseDTO> fdhs = fdhService.getFdhsByCity(city);
        return ResponseEntity.ok(fdhs);
    }

    @GetMapping("/by-region") // Keep the path, but now requires city too
    public ResponseEntity<List<Fdh>> getFdhsByCityAndRegion(
            @RequestParam String city,   // Require city
            @RequestParam String region) { // Require region
        List<Fdh> fdhs = fdhService.getFdhsByCityAndRegion(city, region);
        return ResponseEntity.ok(fdhs);
    }

    @PostMapping
    public ResponseEntity<FdhResponseDTO> createFdh(@RequestBody FdhCreateDTO fdhCreateDTO) {
        FdhResponseDTO createdFdh = fdhService.createFdh(fdhCreateDTO);
        return new ResponseEntity<>(createdFdh, HttpStatus.CREATED); // Return 201
    }

}
