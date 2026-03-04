package com.example.TeamFinder.controller;

import com.example.TeamFinder.entity.User;
import com.example.TeamFinder.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    @Autowired
    private UserService userService;

    @PostMapping("/signup-admin")
    public ResponseEntity<?> signup(@RequestBody User user)
    {
        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
        boolean authenticated = authentication.isAuthenticated();
        if(authenticated)
        {
        userService.saveAdmin(user);
        return new ResponseEntity<>("Admin Added!",HttpStatusCode.valueOf(200));

        }
        return new ResponseEntity<>("Access Denied!",HttpStatusCode.valueOf(404));


    }

    // 1. Endpoint to create a new Club President
    @PostMapping("/create-president")
    public ResponseEntity<?> createPresident(@RequestBody User user) {
        boolean success = userService.createPresident(user);
        if (success) {
            return new ResponseEntity<>("President account created successfully.", HttpStatus.CREATED);
        }
        return new ResponseEntity<>("Failed to create President. Username may already exist.", HttpStatus.BAD_REQUEST);
    }

    // 2. Endpoint to create a new Super Admin
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody User user) {
        try {
            userService.saveAdmin(user);
            return new ResponseEntity<>("Admin account created successfully.", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to create Admin account.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
