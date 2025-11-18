package com.project.NetworkApp.controller;

// Make sure all these imports are correct for your project
import com.project.NetworkApp.Repository.UserRepository;
import com.project.NetworkApp.entity.User;
import com.project.NetworkApp.enums.UserRole; // <-- Import your enum
import com.project.NetworkApp.exception.RoleNotValidException;
import com.project.NetworkApp.security.jwt.JwtUtils;
import com.project.NetworkApp.security.payload.request.LoginRequest;
import com.project.NetworkApp.security.payload.request.SignupRequest;
import com.project.NetworkApp.security.payload.response.JwtResponse;
import com.project.NetworkApp.security.payload.response.MessageResponse;
import com.project.NetworkApp.security.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;

    private final PasswordEncoder encoder;

    private final JwtUtils jwtUtils;


    @PostMapping("/signin")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {


        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        try {

            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found after login"));


            user.setLastLogin(LocalDateTime.now());

            userRepository.save(user);
        } catch (Exception e) {

            logger.error("Could not update lastLogin time for user {}: {}", userDetails.getUsername(), e.getMessage());
        }


        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error: Role not found."));

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                role));
    }


    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {


        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }




        User user = new User();


        user.setUsername(signUpRequest.getUsername());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        user.setEmail(signUpRequest.getEmail());


        String strRole = signUpRequest.getRole();
        UserRole role;

        if (strRole == null || strRole.isEmpty()) {
            role = UserRole.SALES_AGENT;
        } else {
            try {
                role = UserRole.valueOf(strRole.toUpperCase());
            } catch (RoleNotValidException e) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Role '" + strRole + "' is not valid!"));
            }
        }

        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}