package com.example.TeamFinder.controller;

import com.example.TeamFinder.entity.User;
import com.example.TeamFinder.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/home")
// Optional: @CrossOrigin(origins = "http://localhost:5173") // Add this if you get CORS errors!
public class HomeController {

    @Autowired
    private UserService userService;

    @GetMapping("/search-by-username/{username}")
    public ResponseEntity<?> searchUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.searchUserByUsername(username);
        // Better handling: Return 404 if not found
        if (user.isPresent()) {
            return new ResponseEntity<>(user.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/search-by-name/{name}")
    public ResponseEntity<?> searchByName(@PathVariable String name) {
        List<User> users = userService.searchUserByName(name);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/search-by-skill/{skill}")
    public ResponseEntity<?> searchBySkill(@PathVariable String skill) {
        List<User> users = userService.searchUserBySkill(skill);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Replace your existing likeUserProfile method in HomeController.java
    @PostMapping("/like/{targetUsername}")
    public ResponseEntity<?> likeUserProfile(
            @PathVariable String targetUsername,
            @RequestParam String likerUsername) { // <-- Added RequestParam

        boolean success = userService.likeUser(targetUsername, likerUsername);

        if (success) {
            return new ResponseEntity<>(HttpStatus.OK);
        }
        // Return a 400 Bad Request if they already liked it or the user doesn't exist
        return new ResponseEntity<>("User already liked this profile", HttpStatus.BAD_REQUEST);
    }
}