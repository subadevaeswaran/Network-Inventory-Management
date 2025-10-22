package com.project.NetworkApp.controller;

// package com.project.NetworkApp.controller;
// ... imports
import com.project.NetworkApp.DTO.TechnicianDTO;
import com.project.NetworkApp.Service.TechnicianService;
import com.project.NetworkApp.entity.Technician;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/technicians")
@CrossOrigin("http://localhost:5173")

@RequiredArgsConstructor
public class TechnicianController {
    private final TechnicianService technicianService;

    @GetMapping
    public ResponseEntity<List<Technician>> getTechnicians(
            // Make region optional
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(technicianService.getTechnicians(region));
    }
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<TechnicianDTO> getTechnicianByUserId(@PathVariable Integer userId) {
        // Call the service method we created earlier
        Optional<TechnicianDTO> technicianOpt = technicianService.getTechnicianByUserId(userId);

        if (technicianOpt.isPresent()) {
            return ResponseEntity.ok(technicianOpt.get()); // Return 200 OK if found
        }else {
            // Log that the technician wasn't found for this user ID
            System.err.println("WARN: Technician not found for user ID: " + userId);
            return ResponseEntity.notFound().build(); // Return 404 Not Found
        }
    }
}
