package com.project.NetworkApp.Utility;

// package com.project.NetworkApp.util;

import com.project.NetworkApp.DTO.UserCreateDTO;
import com.project.NetworkApp.DTO.UserResponseDTO;
import com.project.NetworkApp.entity.User;

/**
 * Utility class to map between User entities and DTOs.
 */
public class UserUtility {

    /**
     * Private constructor to prevent instantiation.
     */
    private UserUtility() {}

    /**
     * Converts a User entity to a UserResponseDTO.
     * @param user The User entity.
     * @return A safe UserResponseDTO (no password).
     */
    public static UserResponseDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        return new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getLastLogin()
        );
    }

    /**
     * Converts a UserCreateDTO to a User entity.
     * The password is set in the service layer.
     * @param dto The UserCreateDTO.
     * @return A new User entity (not yet saved).
     */
    public static User toEntity(UserCreateDTO dto) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setUsername(dto.username());
        user.setRole(dto.role());

        // !!! WARNING: Plain-text password is set in the service !!!
        // We set the password in the service, not the utility,
        // to make it clear where this happens.

        return user;
    }
}