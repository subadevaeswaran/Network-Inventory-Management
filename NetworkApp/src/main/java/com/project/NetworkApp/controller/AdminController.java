package com.project.NetworkApp.controller;


import com.project.NetworkApp.DTO.UserListResponseDTO;
import com.project.NetworkApp.security.payload.response.MessageResponse;
import com.project.NetworkApp.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin")
// This entire controller is now implicitly for admins
// (We will also protect it in WebSecurityConfig)
public class AdminController {

    @Autowired
    private UserService userService;

    /**
     * Endpoint for Admins to fetch all users.
     */
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')") // Double-check security
    public ResponseEntity<List<UserListResponseDTO>> getAllUsers() {
        List<UserListResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Endpoint for Admins to delete a user.
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // You can add more admin endpoints here later (e.g., /metrics)
}

