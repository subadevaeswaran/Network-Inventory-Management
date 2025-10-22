package com.project.NetworkApp.Repository;

// package com.project.NetworkApp.repository;

import com.project.NetworkApp.entity.DeploymentTask;
import com.project.NetworkApp.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeploymentTaskRepository extends JpaRepository<DeploymentTask, Integer> {
    List<DeploymentTask> findByTechnicianIdAndStatus(Integer technicianId, TaskStatus status);
    // --- End Fix ---

    List<DeploymentTask> findByTechnicianId(Integer technicianId); // Keep
}
