package com.example.TeamFinder.controller;

import com.example.TeamFinder.entity.User;
import com.example.TeamFinder.service.UserService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    //get user to render dashboard
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable String id) {

        return userService.getUserProfile(id);
    }


    @PutMapping("/change-bio")
    public ResponseEntity<?> changeBio(@RequestBody User user)
    {
        boolean b = userService.changeBio(user);
        if(b)
            return new ResponseEntity<>(HttpStatus.valueOf(200));
        else return new ResponseEntity<>(HttpStatus.valueOf(400));
    }
    @PostMapping("/add-email")
    public ResponseEntity<?> addEmail(@RequestBody User user)
    {
        boolean b = userService.addEmail(user);
        if(b)
            return new ResponseEntity<>(HttpStatus.valueOf(200));
        else return new ResponseEntity<>(HttpStatus.valueOf(400));
    }
    @DeleteMapping("/delete-email")
    public ResponseEntity<?> deleteEmail(@RequestBody User user)
    {
        boolean b = userService.deleteEmail(user);
        if(b)
            return new ResponseEntity<>(HttpStatus.valueOf(200));
        else return new ResponseEntity<>(HttpStatus.valueOf(400));
    }
    @PostMapping("/add-college")
    public ResponseEntity<?> addCollege(@RequestBody User user)
    {
        boolean b = userService.addCollege(user);
        if(b)
            return new ResponseEntity<>(HttpStatus.valueOf(200));
        else return new ResponseEntity<>(HttpStatus.valueOf(400));
    }

    @PostMapping("/delete-college")
    public ResponseEntity<?> deleteCollege(@RequestBody User user)
    {
        boolean b = userService.deleteCollege(user);
        if(b)
            return new ResponseEntity<>(HttpStatus.valueOf(200));
        else return new ResponseEntity<>(HttpStatus.valueOf(400));
    }
    @PostMapping("/add-skill")
    public ResponseEntity<?> addSkill(@RequestBody User user)
    {
        boolean b = userService.addSkill(user);
        if(b)
            return new ResponseEntity<>(HttpStatusCode.valueOf(200));
        else return new ResponseEntity<>(HttpStatusCode.valueOf(400));
    }
    @DeleteMapping("/delete-skill/{skill}")
    public ResponseEntity<?> deleteSkill(@RequestBody User user, @PathVariable String skill)
    {
        boolean b = userService.removeSkill(user, skill);
        if(b)
            return new ResponseEntity<>(HttpStatusCode.valueOf(200));
        else return new ResponseEntity<>(HttpStatusCode.valueOf(400));
    }

}
