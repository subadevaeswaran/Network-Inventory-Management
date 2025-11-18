package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.UserListResponseDTO;
import com.project.NetworkApp.security.payload.response.MessageResponse;
import com.project.NetworkApp.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')") // Double-check security
    public ResponseEntity<List<UserListResponseDTO>> getAllUsers() {
        List<UserListResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable("id") Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}

