package com.project.NetworkApp.security.config;

import com.project.NetworkApp.security.jwt.AuthEntryPointJwt;
import com.project.NetworkApp.security.jwt.AuthTokenFilter;
import com.project.NetworkApp.security.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.ComponentScan;

@Configuration
@EnableWebSecurity
@ComponentScan(basePackages = "com.project.NetworkApp.security")
public class WebSecurityConfig {
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;


    @Autowired
    private AuthTokenFilter authTokenFilter;



    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    public final static String[] PUBLIC_REQUEST_MATCHERS = { "/api/test/all","/api/v1/auth/**", "/api-docs/**", "/swagger-ui/**","/v3/api-docs/**" };

    // In your SecurityConfig class
    // In WebSecurityConfig.java
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.
                        requestMatchers(PUBLIC_REQUEST_MATCHERS).permitAll() // Public paths

                        // --- Use YOUR Roles ---
                        .requestMatchers("/assets/**").hasAnyAuthority("ADMIN","PLANNER","TECHNICIAN")
                        .requestMatchers("/assigned-assets/**").hasAnyAuthority("ADMIN", "SALES_AGENT", "SUPPORTAGENT" ,"TECHNICIAN")
                        .requestMatchers("/assignments/**").hasAuthority("PLANNER")
                        .requestMatchers("/auditlogs/**").hasAuthority("ADMIN")
                        .requestMatchers("/customer/**").hasAnyAuthority("ADMIN","PLANNER" , "TECHNICIAN", "SALES_AGENT", "SUPPORTAGENT")
                        .requestMatchers("/dashboard/**").hasAnyAuthority("ADMIN", "PLANNER")
                        .requestMatchers("/tasks/**").hasAnyAuthority("ADMIN", "PLANNER", "TECHNICIAN")
                        .requestMatchers("/fdh/**").hasAnyAuthority("ADMIN", "TECHNICIAN", "PLANNER")
                        .requestMatchers("/headends/**").hasAnyAuthority("ADMIN", "PLANNER", "SALES_AGENT", "TECHNICIAN")
                        .requestMatchers("/splitters/**").hasAnyAuthority("ADMIN", "PLANNER", "TECHNICIAN")
                        .requestMatchers("/technicians/**").hasAnyAuthority("ADMIN", "PLANNER", "TECHNICIAN")
                        .requestMatchers("/topology/**").hasAnyAuthority("ADMIN")


                        // Example: Multiple roles can access a path
                        .requestMatchers("/api/v1/auth/**").hasAnyAuthority("ADMIN", "PLANNER","TECHNICIAN", "SALES_AGENT", "SUPPORTAGENT")

                        // All other requests must be authenticated
                        .anyRequest().authenticated()
                )
                // ... rest of your config is perfect ...
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Rule 1: Allow requests from your React app's origin.
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // Rule 2: Allow standard HTTP methods.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Rule 3: THIS IS THE MOST IMPORTANT PART.
        // You must explicitly allow the 'Authorization' and 'Content-Type' headers.
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));

        // Rule 4: Allow credentials (cookies, etc.) if needed in the future.
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply this configuration to all paths.
        return source;
    }
}