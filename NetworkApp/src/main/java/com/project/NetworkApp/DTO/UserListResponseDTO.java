package com.project.NetworkApp.DTO;

import com.project.NetworkApp.entity.User;
import com.project.NetworkApp.enums.UserRole;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserListResponseDTO {
    private Integer id;
    private String username;
    private String email;
    private UserRole role;
    private LocalDateTime lastLogin;

    // We can create a simple constructor to map from the entity
    public UserListResponseDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.lastLogin = user.getLastLogin();
    }
}