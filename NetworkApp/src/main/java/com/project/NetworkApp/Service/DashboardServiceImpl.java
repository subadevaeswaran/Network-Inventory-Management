package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.DashboardMetricsDTO;
import com.project.NetworkApp.Repository.AssetRepository;
import com.project.NetworkApp.Repository.AssignedAssetsRepository;
import com.project.NetworkApp.Repository.CustomerRepository;
import com.project.NetworkApp.Repository.DeploymentTaskRepository;
import com.project.NetworkApp.Repository.AssignedAssetsRepository;
import com.project.NetworkApp.enums.AssetStatus;
import com.project.NetworkApp.enums.TaskStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final CustomerRepository customerRepository;
    private final AssetRepository assetRepository;
    private final DeploymentTaskRepository deploymentTaskRepository;
    private final AssignedAssetsRepository assignedAssetsRepository;

    @Override
    public DashboardMetricsDTO getAdminDashboardMetrics() {
        long totalCustomers = customerRepository.count();
        long activeDeployments = deploymentTaskRepository.countByStatus(TaskStatus.COMPLETED);
        long availableDevices = assetRepository.countByStatus(AssetStatus.AVAILABLE);
        long pendingTasks = deploymentTaskRepository.countByStatusIn(
                List.of(TaskStatus.SCHEDULED, TaskStatus.INPROGRESS)

        );
        long totalAssetAssignments = assignedAssetsRepository.count();

        return new DashboardMetricsDTO(
                totalCustomers,
                activeDeployments,
                availableDevices,
                pendingTasks,
                totalAssetAssignments
        );
    }
}
