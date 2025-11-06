package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;

import com.project.NetworkApp.DTO.LoginRequestDTO;
import com.project.NetworkApp.DTO.UserCreateDTO;
import com.project.NetworkApp.DTO.UserListResponseDTO;
import com.project.NetworkApp.DTO.UserResponseDTO;

import java.util.List;

public interface UserService {
    /**
     * Creates a new user, hashes their password, and saves them.
     * @param userCreateDTO DTO containing new user details.
     * @return DTO of the created user.
     */
    UserResponseDTO createUser(UserCreateDTO userCreateDTO);
    UserResponseDTO login(LoginRequestDTO loginRequestDTO);

    List<UserListResponseDTO> getAllUsers();

    void deleteUser(Integer userId);
}