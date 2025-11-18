package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.CompleteTaskRequestDTO;
import com.project.NetworkApp.DTO.DeploymentTaskCreateDTO;
import com.project.NetworkApp.DTO.DeploymentTaskDTO;
import com.project.NetworkApp.Service.DeploymentTaskService;
import com.project.NetworkApp.enums.TaskStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
public class DeploymentTaskController {

    private final DeploymentTaskService taskService;

    @GetMapping("/my-tasks")
    public ResponseEntity<List<DeploymentTaskDTO>> getMyTasks(
            @RequestParam Integer technicianId,
            @RequestParam(defaultValue = "SCHEDULED") TaskStatus status) {
        List<DeploymentTaskDTO> tasks = taskService.getTechnicianTasksByStatus(technicianId, status);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/{taskId}/complete")
    public ResponseEntity<Void> completeTask(
            @PathVariable Integer taskId, // Get task ID from the URL path
            @RequestBody CompleteTaskRequestDTO completionDetails) { // Get details from request body
        taskService.completeTask(taskId, completionDetails); // Call the service method
        return ResponseEntity.ok().build(); // Return 200 OK on success
    }

    @GetMapping
    public ResponseEntity<List<DeploymentTaskDTO>> getAllTasks(
            @RequestParam(required = false) TaskStatus status) {
        List<DeploymentTaskDTO> tasks = taskService.getAllTasks(status);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<DeploymentTaskDTO> createDeploymentTask(@RequestBody DeploymentTaskCreateDTO dto) {
        DeploymentTaskDTO createdTask = taskService.createDeploymentTask(dto);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED); // Return 201
    }

}