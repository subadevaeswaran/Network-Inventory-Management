package com.project.NetworkApp.Service;

import com.project.NetworkApp.DTO.LoginRequestDTO;
import com.project.NetworkApp.DTO.UserCreateDTO;
import com.project.NetworkApp.DTO.UserListResponseDTO;
import com.project.NetworkApp.DTO.UserResponseDTO;
import com.project.NetworkApp.entity.User;
import com.project.NetworkApp.Repository.UserRepository;
import com.project.NetworkApp.Utility.UserUtility;
import com.project.NetworkApp.exception.AdminDeleteException;
import com.project.NetworkApp.exception.IncorrectPasswordException;
import com.project.NetworkApp.exception.UserInvalidException;
import com.project.NetworkApp.exception.UserNotFoundException;
import com.project.NetworkApp.security.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService {


    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // Use the Optional method from your repository
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with username: " + username)
                );

        // Return Spring Security's User object
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>() // You can add user.getRole() here later
        );
    }

    @Override
    public UserResponseDTO createUser(UserCreateDTO userCreateDTO) {
        // Convert DTO to entity using the utility
        User newUser = UserUtility.toEntity(userCreateDTO);

        // !!! WARNING: Storing plain-text password !!!
        newUser.setPassword(passwordEncoder.encode(userCreateDTO.password()));

        User savedUser = userRepository.save(newUser);

        // Convert saved entity to DTO using the utility
        return UserUtility.toDTO(savedUser);
    }
    @Override
    public UserResponseDTO login(LoginRequestDTO loginRequestDTO) {
        // 1. Find the user by username
        User user = userRepository.findByUsername(loginRequestDTO.username())
                .orElseThrow(() -> new UserNotFoundException("No user with this name"));

        // 2. Check the password (plain text check, as requested)
        if (!user.getPassword().equals(loginRequestDTO.password())) {
            throw new IncorrectPasswordException("Incorrect password");
        }

        // 3. Check the role
        if (user.getRole() != loginRequestDTO.role()) {
            throw new UserInvalidException("User role does not match");
        }

        // 4. Login successful, update lastLogin time
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return UserUtility.toDTO(user);
    }

    @Override
    public List<UserListResponseDTO> getAllUsers() {
        // Fetch all users from the repository
        List<User> users = userRepository.findAll();

        // Convert the list of User entities to a list of DTOs
        return users.stream()
                .map(UserListResponseDTO::new) // Uses the constructor we made
                .toList();
    }

    @Override
    public void deleteUser(Integer userId) {
        // Optional: Add a check to prevent users from deleting themselves
        UserDetailsImpl currentUser = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (currentUser.getId().equals(userId.longValue())) {
            throw new AdminDeleteException("Admin users cannot delete their own account.");
        }

        // Find by ID and delete
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        userRepository.delete(user);
    }

    // The private toResponseDTO method is no longer needed here.
}
