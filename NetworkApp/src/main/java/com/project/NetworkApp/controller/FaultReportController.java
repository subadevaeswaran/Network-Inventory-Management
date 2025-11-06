package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.FaultReportDTO;
import com.project.NetworkApp.Service.FaultReportService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/devices") // Matches the path in your code
@RequiredArgsConstructor
public class FaultReportController {

    private final FaultReportService faultReportService;

    @PostMapping("/report")
    public ResponseEntity<?> reportFault(@RequestBody FaultReportDTO dto) {
        try {
            faultReportService.reportFault(dto);
            // Return a simple success message
            return ResponseEntity.ok(Map.of("message", "Fault report submitted successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }
}