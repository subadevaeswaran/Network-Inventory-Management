package com.project.NetworkApp.controller;

// package com.project.NetworkApp.controller;

import com.project.NetworkApp.DTO.LoginRequestDTO;
import com.project.NetworkApp.DTO.UserCreateDTO;
import com.project.NetworkApp.DTO.UserResponseDTO;
import com.project.NetworkApp.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users") // <-- UPDATED: No "/api/v1"
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * POST /users
     * Creates a new user (e.g., Sales_Agent).
     */
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserCreateDTO userCreateDTO) {
        UserResponseDTO createdUser = userService.createUser(userCreateDTO);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> loginUser(@RequestBody LoginRequestDTO loginRequestDTO) {
        UserResponseDTO user = userService.login(loginRequestDTO);
        return ResponseEntity.ok(user);}
}