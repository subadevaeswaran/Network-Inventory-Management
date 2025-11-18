package com.project.NetworkApp.security.service;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.NetworkApp.entity.User;
import com.project.NetworkApp.enums.UserRole; // Make sure to import your enum
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections; // Import this
import java.util.List;
import java.util.Objects;

@SuppressWarnings("java:S1206")
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id; // This class expects a Long

    private String username;

    @JsonIgnore
    private String password;

    // This field is REQUIRED by Spring Security. It is correct.
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String password,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    // --- THIS IS THE FIXED METHOD ---
    public static UserDetailsImpl build(User user) {

        // 1. Get the single role from your User entity
        UserRole role = user.getRole();

        // 2. Create a single "authority" (role) from that enum
        GrantedAuthority authority = new SimpleGrantedAuthority(role.name());

        // 3. Put that single authority into a List (Spring Security needs a Collection)
        List<GrantedAuthority> authorities = Collections.singletonList(authority);

        // 4. Build the UserDetailsImpl object
        return new UserDetailsImpl(
                user.getId().longValue(), // <-- FIX 2: Convert your Integer ID to a Long
                user.getUsername(),
                user.getPassword(),
                authorities); // Pass the list containing your one role
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // This method is correct and simply returns the field
        return authorities;
    }

    public Long getId() {
        return id;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    // --- All these @Override methods are correct and required ---
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}