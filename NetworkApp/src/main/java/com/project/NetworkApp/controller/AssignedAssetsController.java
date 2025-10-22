package com.project.NetworkApp.controller;


import com.project.NetworkApp.DTO.AssignedAssetsResponseDTO;
import com.project.NetworkApp.Service.AssignedAssetsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/assigned-assets")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class AssignedAssetsController {
    private final AssignedAssetsService assignedAssetsService;

    @GetMapping("/by-customer/{customerId}")
    public ResponseEntity<List<AssignedAssetsResponseDTO>> getAssignedAssets(
            @PathVariable Integer customerId) {
        return ResponseEntity.ok(assignedAssetsService.getAssetsAssignedToCustomer(customerId));
    }
}