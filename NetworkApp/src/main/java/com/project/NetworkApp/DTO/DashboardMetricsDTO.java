package com.project.NetworkApp.DTO;

public record DashboardMetricsDTO(
        long totalCustomers,
        long activeDeployments, // Completed tasks
        long availableDevices,
        long pendingTasks,
        long totalAssetAssignments// Scheduled or InProgress tasks
) {}
