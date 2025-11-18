package com.project.NetworkApp.controller;



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

    @PostMapping
    public ResponseEntity<Void> createAssignment(@RequestBody AssignmentRequestDTO assignmentRequestDTO) {
        assignmentService.assignNetworkPath(assignmentRequestDTO);
        return ResponseEntity.ok().build(); // Return 200 OK on success
    }
}