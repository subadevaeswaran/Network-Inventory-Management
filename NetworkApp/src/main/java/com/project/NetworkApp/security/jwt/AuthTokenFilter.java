package com.project.NetworkApp.security.jwt;

import com.project.NetworkApp.security.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;


    private final UserDetailsServiceImpl userDetailsService;

    private static final Logger log = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. Get the JWT from the "Authorization" header
            String jwt = parseJwt(request);

            // 2. If the token exists and is valid
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {

                // 3. Get the username from the token
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                // 4. Load the user's details from the database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 5. Create an "Authentication" object
                // This is Spring Security's way of representing the logged-in user
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null, // We don't need credentials
                                userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Set the user in the SecurityContext
                // This is the most important part:
                // We are telling Spring "This user is authenticated"
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        // 7. Continue the filter chain
        // This passes the request to the next filter and, eventually, your controller
        filterChain.doFilter(request, response);
    }

    // This is a helper to parse the "Bearer <token>" string
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Return just the token part
        }

        return null;
    }
}