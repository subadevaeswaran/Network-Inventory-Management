package com.project.NetworkApp.controller;

// Make sure all these imports are correct for your project
import com.project.NetworkApp.Repository.UserRepository;
import com.project.NetworkApp.entity.User;
import com.project.NetworkApp.enums.UserRole; // <-- Import your enum
import com.project.NetworkApp.security.jwt.JwtUtils;
import com.project.NetworkApp.security.payload.request.LoginRequest;
import com.project.NetworkApp.security.payload.request.SignupRequest;
import com.project.NetworkApp.security.payload.response.JwtResponse;
import com.project.NetworkApp.security.payload.response.MessageResponse;
import com.project.NetworkApp.security.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    // --- FIX 1: RoleRepository is REMOVED ---
    // @Autowired
    // RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    /**
     * Handles user sign-in.
     * This method is correct and does NOT need to change.
     * It works perfectly with your single-role setup.
     */
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        // This part is the same. It checks the password.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // --- THIS IS THE FIX ---
        try {
            // 5. Find the user entity from the DB using the authenticated username
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found after login"));

            // 6. Update the lastLogin field
            user.setLastLogin(LocalDateTime.now());

            // 7. Save the update to the database
            userRepository.save(user);
        } catch (Exception e) {
            // We log the error but do NOT fail the login.
            // The user should still get their token.
            logger.error("Could not update lastLogin time for user {}: {}", userDetails.getUsername(), e.getMessage());
        }
        // --- END OF FIX ---

        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Error: Role not found."));

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                role));
    }

    /**
     * Handles new user registration (sign-up).
     * --- FIX 2: This method is now updated to match your User.java entity ---
     */
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {

        // Check 1: Username availability
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

        // --- THIS IS THE FIX ---

        // 1. Create a new, empty user object
        User user = new User();

        // 2. Set the properties using the setter methods
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        // --- END OF FIX ---

        user.setEmail(signUpRequest.getEmail());

        // This part for setting the role is the same as before
        String strRole = signUpRequest.getRole();
        UserRole role;

        if (strRole == null || strRole.isEmpty()) {
            role = UserRole.SALES_AGENT;
        } else {
            try {
                role = UserRole.valueOf(strRole.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Role '" + strRole + "' is not valid!"));
            }
        }

        // 3. Set the role on the user object
        user.setRole(role);

        // Save the user to the database
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}