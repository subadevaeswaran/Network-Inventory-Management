package com.project.NetworkApp.controller;

// package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.AssignmentRequestDTO;
import com.project.NetworkApp.Service.AssignmentService; // We'll create this next
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/assignments")
@CrossOrigin("http://localhost:5173")

@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    /**
     * POST /assignments
     * Assigns a customer to a network path (Splitter/Port) and creates a deployment task.
     * Corresponds to Planner's Journey Step 2.
     */
    @PostMapping
    public ResponseEntity<Void> createAssignment(@RequestBody AssignmentRequestDTO assignmentRequestDTO) {
        assignmentService.assignNetworkPath(assignmentRequestDTO);
        return ResponseEntity.ok().build(); // Return 200 OK on success
    }
}