package com.project.NetworkApp.controller;

// package com.project.NetworkApp.controller;

import com.project.NetworkApp.Service.FdhService;
import com.project.NetworkApp.entity.Fdh;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fdh")
@CrossOrigin("http://localhost:5173")// Base path for FDH-related endpoints
@RequiredArgsConstructor
public class FdhController {
    @Autowired
    private FdhService fdhService;

    /**
     * GET /fdh/regions
     * Gets a unique list of all neighborhood regions where FDHs are present.
     */
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
    public ResponseEntity<List<Fdh>> getFdhsByCity(@RequestParam String city) {
        return ResponseEntity.ok(fdhService.getFdhsByCity(city));
    }

    @GetMapping("/by-region")
    public ResponseEntity<List<Fdh>> getFdhsByRegion(@RequestParam String region) {
        return ResponseEntity.ok(fdhService.getFdhsByRegion(region));
    }
}
