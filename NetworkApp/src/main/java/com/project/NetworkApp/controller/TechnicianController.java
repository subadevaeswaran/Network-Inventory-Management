package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.TechnicianDTO;
import com.project.NetworkApp.Service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger log = LoggerFactory.getLogger(TechnicianController.class);
    @GetMapping
    public ResponseEntity<List<TechnicianDTO>> getTechnicians(
            @RequestParam(required = false) String region) {
        return ResponseEntity.ok(technicianService.getTechnicians(region));
    }
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<TechnicianDTO> getTechnicianByUserId(@PathVariable Integer userId) {
        Optional<TechnicianDTO> technicianOpt = technicianService.getTechnicianByUserId(userId);

        if (technicianOpt.isPresent()) {
            return ResponseEntity.ok(technicianOpt.get());
        }else {
            log.error("WARN: Technician not found for user ID: {}", userId);
            return ResponseEntity.notFound().build();
        }
    }
}
