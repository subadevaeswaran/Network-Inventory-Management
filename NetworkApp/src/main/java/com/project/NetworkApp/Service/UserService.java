package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.LoginRequestDTO;
import com.project.NetworkApp.DTO.UserCreateDTO;
import com.project.NetworkApp.DTO.UserListResponseDTO;
import com.project.NetworkApp.DTO.UserResponseDTO;

import java.util.List;
public interface UserService {

    UserResponseDTO createUser(UserCreateDTO userCreateDTO);
    UserResponseDTO login(LoginRequestDTO loginRequestDTO);

    List<UserListResponseDTO> getAllUsers();

    void deleteUser(Integer userId);
}