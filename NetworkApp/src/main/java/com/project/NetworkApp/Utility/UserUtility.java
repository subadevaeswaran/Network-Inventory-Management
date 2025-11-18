package com.project.NetworkApp.Utility;

import com.project.NetworkApp.DTO.UserCreateDTO;
import com.project.NetworkApp.DTO.UserResponseDTO;
import com.project.NetworkApp.entity.User;

public class UserUtility {

    private UserUtility() {}

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

    public static User toEntity(UserCreateDTO dto) {
        if (dto == null) {
            return null;
        }
        User user = new User();
        user.setUsername(dto.username());
        user.setRole(dto.role());
        return user;
    }
}