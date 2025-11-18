package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.DashboardMetricsDTO;
import com.project.NetworkApp.Service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard") // Base path for dashboard related endpoints
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsDTO> getAdminMetrics() {
        DashboardMetricsDTO metrics = dashboardService.getAdminDashboardMetrics();
        return ResponseEntity.ok(metrics);
    }
}