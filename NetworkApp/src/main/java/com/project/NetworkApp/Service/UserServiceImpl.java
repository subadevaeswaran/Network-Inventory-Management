package com.project.NetworkApp.Service;

// package com.project.NetworkApp.service;

import com.project.NetworkApp.DTO.LoginRequestDTO;
import com.project.NetworkApp.DTO.UserCreateDTO;
import com.project.NetworkApp.DTO.UserResponseDTO;
import com.project.NetworkApp.entity.User;
import com.project.NetworkApp.Repository.UserRepository;
import com.project.NetworkApp.Utility.UserUtility; // <-- Import utility
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserResponseDTO createUser(UserCreateDTO userCreateDTO) {
        // Convert DTO to entity using the utility
        User newUser = UserUtility.toEntity(userCreateDTO);

        // !!! WARNING: Storing plain-text password !!!
        newUser.setPassword(userCreateDTO.password());

        User savedUser = userRepository.save(newUser);

        // Convert saved entity to DTO using the utility
        return UserUtility.toDTO(savedUser);
    }
    @Override
    public UserResponseDTO login(LoginRequestDTO loginRequestDTO) {
        // 1. Find the user by username
        User user = userRepository.findByUsername(loginRequestDTO.username())
                .orElseThrow(() -> new EntityNotFoundException("No user with this name"));

        // 2. Check the password (plain text check, as requested)
        if (!user.getPassword().equals(loginRequestDTO.password())) {
            throw new SecurityException("Incorrect password");
        }

        // 3. Check the role
        if (user.getRole() != loginRequestDTO.role()) {
            throw new SecurityException("User role does not match");
        }

        // 4. Login successful, update lastLogin time
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return UserUtility.toDTO(user);
    }

    // The private toResponseDTO method is no longer needed here.
}
