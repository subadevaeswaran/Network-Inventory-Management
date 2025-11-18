package com.project.NetworkApp.security.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Email // Add validation
    private String email;

    private String role;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;


}