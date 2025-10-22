package com.project.NetworkApp.Service;





import com.project.NetworkApp.DTO.CompleteTaskRequestDTO;
import com.project.NetworkApp.DTO.DeploymentTaskDTO;
import com.project.NetworkApp.enums.TaskStatus;
import java.util.List;

public interface DeploymentTaskService {

    /**
     * Retrieves tasks for a specific technician filtered by status.
     * @param technicianId The ID of the technician.
     * @param status The desired task status (e.g., SCHEDULED).
     * @return A list of matching task DTOs.
     */
    List<DeploymentTaskDTO> getTechnicianTasksByStatus(Integer technicianId, TaskStatus status);

    /**
     * Marks a task as complete, assigns assets, and updates customer status.
     * @param taskId The ID of the task to complete.
     * @param completionDetails DTO containing asset IDs and notes.
     */
    void completeTask(Integer taskId, CompleteTaskRequestDTO completionDetails);

    // Add other methods later if needed (e.g., updateTaskStatusToInProgress)
}
