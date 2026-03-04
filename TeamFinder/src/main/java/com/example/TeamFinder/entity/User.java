package com.example.TeamFinder.entity;

import lombok.Data;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document("user")
@Data
public class User {
    @Id
    private String id;
    @Indexed(unique = true)
    @NonNull
    private String username;
    private String password;
    private String name;
    private String email;
    private String college;
    private String bio;
    private String branch;
    private List<String> skill;
    private List<String> roles;
    private List<String> posts;
    private String experienceTag; // "Beginner", "Intermediate", "Pro"
    private int likesReceived; // Increases when a team leader likes their profile

    // Add this new field to your User.java class
    private List<String> likedBy;

// Make sure to add the Getter and Setter for it if you aren't using Lombok's @Data!
}
