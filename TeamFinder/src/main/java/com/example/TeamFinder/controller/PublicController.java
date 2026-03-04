package com.example.TeamFinder.controller;

import com.example.TeamFinder.entity.LoginRequest;
import com.example.TeamFinder.entity.User;
import com.example.TeamFinder.service.PublicService;
import com.example.TeamFinder.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/public")
public class PublicController {

    @Autowired
    private PublicService publicService;
    @Autowired
    private UserService userService;
    @GetMapping("/health-check")
    public ResponseEntity<?> heathCheck()
    {
        return new ResponseEntity<>(publicService.healthCheck(), HttpStatusCode.valueOf(200));
    }
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody User user)
    {
        userService.signup(user);
        return new ResponseEntity<>(HttpStatus.valueOf(200));
    }
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody LoginRequest loginRequest)
    {

        ResponseEntity<?> signin = userService.signin(loginRequest);
        return signin;
    }

}
