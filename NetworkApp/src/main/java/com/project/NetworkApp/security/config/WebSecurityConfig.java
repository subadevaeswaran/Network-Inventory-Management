package com.project.NetworkApp.security.config;

import com.project.NetworkApp.security.Constant.EndpointConstants;
import com.project.NetworkApp.security.Constant.RoleConstants;
import com.project.NetworkApp.security.jwt.AuthEntryPointJwt;
import com.project.NetworkApp.security.jwt.AuthTokenFilter;
import com.project.NetworkApp.security.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class WebSecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;

    private final AuthEntryPointJwt unauthorizedHandler;

    private final AuthTokenFilter authTokenFilter;

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

    protected final String[] publicRequestMatching = { "/api/test/all","/api/v1/auth/**", "/api-docs/**", "/swagger-ui/**","/v3/api-docs/**" };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(publicRequestMatching).permitAll()

                        .requestMatchers(EndpointConstants.ASSETS)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.PLANNER, RoleConstants.TECHNICIAN)

                        .requestMatchers(EndpointConstants.ASSIGNED_ASSETS)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.SALES_AGENT, RoleConstants.SUPPORT_AGENT, RoleConstants.TECHNICIAN)

                        .requestMatchers(EndpointConstants.ASSIGNMENTS)
                        .hasAuthority(RoleConstants.PLANNER)

                        .requestMatchers(EndpointConstants.AUDIT_LOGS)
                        .hasAuthority(RoleConstants.ADMIN)

                        .requestMatchers(EndpointConstants.CUSTOMER)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.PLANNER, RoleConstants.TECHNICIAN, RoleConstants.SALES_AGENT, RoleConstants.SUPPORT_AGENT)

                        .requestMatchers(EndpointConstants.DASHBOARD)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.PLANNER)

                        .requestMatchers(EndpointConstants.TASKS)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.PLANNER, RoleConstants.TECHNICIAN)

                        .requestMatchers(EndpointConstants.FDH)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.TECHNICIAN, RoleConstants.PLANNER)

                        .requestMatchers(EndpointConstants.HEADENDS)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.PLANNER, RoleConstants.SALES_AGENT, RoleConstants.TECHNICIAN)

                        .requestMatchers(EndpointConstants.SPLITTERS)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.PLANNER, RoleConstants.TECHNICIAN)

                        .requestMatchers(EndpointConstants.TECHNICIANS)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.PLANNER, RoleConstants.TECHNICIAN)

                        .requestMatchers(EndpointConstants.TOPOLOGY)
                        .hasAuthority(RoleConstants.ADMIN)

                        .requestMatchers(EndpointConstants.AUTH)
                        .hasAnyAuthority(RoleConstants.ADMIN, RoleConstants.PLANNER, RoleConstants.TECHNICIAN, RoleConstants.SALES_AGENT, RoleConstants.SUPPORT_AGENT)

                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}