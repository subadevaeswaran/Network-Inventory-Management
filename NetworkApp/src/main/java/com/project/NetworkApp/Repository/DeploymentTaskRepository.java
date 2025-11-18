package com.project.NetworkApp.Repository;



import com.project.NetworkApp.entity.DeploymentTask;
import com.project.NetworkApp.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Sort; // <-- Import Sort

import java.util.List;

@Repository
public interface DeploymentTaskRepository extends JpaRepository<DeploymentTask, Integer> {
    List<DeploymentTask> findByTechnicianIdAndStatus(Integer technicianId, TaskStatus status);
    // --- End Fix ---

    List<DeploymentTask> findByTechnicianId(Integer technicianId); // Keep

    long countByStatus(TaskStatus status);
    // Method to count tasks by multiple statuses
    long countByStatusIn(List<TaskStatus> statuses);

    List<DeploymentTask> findByStatus(TaskStatus status, Sort sort);
}
