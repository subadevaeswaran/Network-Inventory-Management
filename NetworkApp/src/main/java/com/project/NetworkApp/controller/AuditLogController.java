package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.AuditLogResponseDTO;
import com.project.NetworkApp.Service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// Add imports for Pageable, Page if using pagination

import java.util.List;

@RestController
@RequestMapping("/auditlogs")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * GET /auditlogs
     * Retrieves all audit log entries (sorted by timestamp descending).
     * TODO: Add pagination and filtering parameters later.
     */
    @GetMapping
    public ResponseEntity<List<AuditLogResponseDTO>> getAllAuditLogs() {
        List<AuditLogResponseDTO> logs = auditLogService.getAllLogs();
        return ResponseEntity.ok(logs);
    }
}