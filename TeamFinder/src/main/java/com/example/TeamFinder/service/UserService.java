package com.example.TeamFinder.service;

import com.example.TeamFinder.entity.LoginRequest;
import com.example.TeamFinder.entity.User;
import com.example.TeamFinder.repository.UserRepository;
import com.example.TeamFinder.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class UserService {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;
    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // get user profile for dashboard rendering
    public ResponseEntity<?> getUserProfile(String id) {
        Optional<User> byUsername = userRepository.findByUsername(id);
        return new ResponseEntity<>(byUsername, HttpStatusCode.valueOf(200));
    }

    public boolean signup(User user) {
        user.setPassword(Objects.requireNonNull(passwordEncoder.encode(user.getPassword())));
        user.setRoles(Arrays.asList("USER"));
        userRepository.insert(user);
        return true;
    }

    public boolean saveAdmin(User user) {
        try{
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRoles(Arrays.asList("USER", "ADMIN"));
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            log.error("Error", e);
            return false;
        }
    }

    // Method to create a Club President
    public boolean createPresident(User user) {
        try {
            // Check if username already exists to prevent overriding
            if (userRepository.findByUsername(user.getUsername()).isPresent()) {
                return false;
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            // Give them both roles so they can still act like a normal user if they want
            user.setRoles(Arrays.asList("USER", "PRESIDENT"));

            userRepository.save(user);
            return true;
        } catch (Exception e) {
            log.error("Error creating president", e);
            return false;
        }
    }
    // Make sure to autowire JwtUtil at the top of your UserService:


    // Update your signin method:
    public ResponseEntity<?> signin(LoginRequest loginRequest) {
        Optional<User> byUsername = userRepository.findByUsername(loginRequest.getUsername());
        if (byUsername.isPresent()) {
            if (passwordEncoder.matches(loginRequest.getPassword(), byUsername.get().getPassword())) {

                // 1. Generate the token!
                String token = jwtUtil.generateToken(loginRequest.getUsername());

                // 2. We need to send both the User AND the token back to React.
                // An easy way is to use a Map:
                Map<String, Object> response = new HashMap<>();
                response.put("user", byUsername.get());
                response.put("token", token);

                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public boolean changeBio(User user) {
        Optional<User> byUsername = userRepository.findByUsername(user.getUsername());
        if (byUsername.isPresent()) {
            byUsername.get().setBio(user.getBio());
            userRepository.save(byUsername.get()); // FIXED: Changed from insert to save
            return true;
        }
        return false;
    }

    public boolean addEmail(User user) {
        Optional<User> byUsername = userRepository.findByUsername(user.getUsername());
        if (byUsername.isPresent()) {
            byUsername.get().setEmail(user.getEmail());
            userRepository.save(byUsername.get());
            return true;
        }
        return false;
    }

    public boolean deleteEmail(User user) {
        Optional<User> byUsername = userRepository.findByUsername(user.getUsername());
        if (byUsername.isPresent()) {
            byUsername.get().setEmail("");
            userRepository.save(byUsername.get());
            return true;
        }
        return false;
    }

    public boolean addCollege(User user) {
        Optional<User> byUsername = userRepository.findByUsername(user.getUsername());
        if (byUsername.isPresent()) {
            byUsername.get().setCollege(user.getCollege());
            userRepository.save(byUsername.get());
            return true;
        }
        return false;
    }

    public boolean deleteCollege(User user) {
        Optional<User> byUsername = userRepository.findByUsername(user.getUsername());
        if (byUsername.isPresent()) {
            byUsername.get().setCollege("");
            userRepository.save(byUsername.get());
            return true;
        }
        return false;
    }

    public List<User> searchUserByName(String name) {
        return userRepository.findByName(name);
    }

    public Optional<User> searchUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<User> searchUserBySkill(String skill) {
        return userRepository.findBySkill(skill);
    }

    public boolean addSkill(User user) {
        Optional<User> byUsername = userRepository.findByUsername(user.getUsername());
        if (byUsername.isPresent()) {
            User existingUser = byUsername.get();

            // FIXED: Prevent NullPointerException if skills list is completely empty
            if (existingUser.getSkill() == null) {
                existingUser.setSkill(new ArrayList<>());
            }

            // Loop through new skills and add them (preventing duplicates)
            if (user.getSkill() != null) {
                for (String skill : user.getSkill()) {
                    if (!existingUser.getSkill().contains(skill)) {
                        existingUser.getSkill().add(skill);
                    }
                }
            }

            userRepository.save(existingUser);
            return true;
        }
        return false;
    }

    public boolean removeSkill(User user, String skillToRemove) {
        Optional<User> byUsername = userRepository.findByUsername(user.getUsername());
        if (byUsername.isPresent()) {
            User existingUser = byUsername.get();

            // FIXED: Prevent NullPointerException
            if (existingUser.getSkill() != null) {
                existingUser.getSkill().remove(skillToRemove);
                userRepository.save(existingUser);
            }
            return true;
        }
        return false;
    }


    // Replace your existing likeUser method in UserService.java
    public boolean likeUser(String targetUsername, String likerUsername) {
        Optional<User> targetUserOpt = userRepository.findByUsername(targetUsername);

        if (targetUserOpt.isPresent()) {
            User targetUser = targetUserOpt.get();

            // 1. Prevent NullPointerException if the list is completely empty in the DB
            if (targetUser.getLikedBy() == null) {
                targetUser.setLikedBy(new ArrayList<>());
            }

            // 2. CHECK: Has this person already liked the profile?
            if (targetUser.getLikedBy().contains(likerUsername)) {
                return false; // Stop! They already liked it.
            }

            // 3. Add the liker's username to the list
            targetUser.getLikedBy().add(likerUsername);

            // 4. Increment likes
            targetUser.setLikesReceived(targetUser.getLikesReceived() + 1);

            // 5. Update experience tag
            if (targetUser.getLikesReceived() >= 10) {
                targetUser.setExperienceTag("Pro");
            } else if (targetUser.getLikesReceived() >= 5) {
                targetUser.setExperienceTag("Intermediate");
            }

            userRepository.save(targetUser);
            return true;
        }
        return false;
    }
}