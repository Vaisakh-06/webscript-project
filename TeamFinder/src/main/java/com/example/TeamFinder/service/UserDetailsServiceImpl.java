package com.example.TeamFinder.service;

import com.example.TeamFinder.entity.User;
import com.example.TeamFinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOpt = userRepository.findByUsername(username);

        // 1. FIXED: Properly check if the Optional contains a user
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 2. FIXED: Prevent NullPointerException if roles are missing
            String[] roles = user.getRoles() != null && !user.getRoles().isEmpty()
                    ? user.getRoles().toArray(new String[0])
                    : new String[]{"USER"}; // Fallback so they aren't completely locked out

            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getUsername())
                    .password(user.getPassword())
                    .roles(roles) // This automatically turns "PRESIDENT" into "ROLE_PRESIDENT"
                    .build();
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}