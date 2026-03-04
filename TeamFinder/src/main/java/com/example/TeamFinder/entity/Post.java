package com.example.TeamFinder.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document("posts")
public class Post {

    @Id
    private String id;

    // The Owner / Creator of the post
    private String username;

    // Hackathon / Requirement Details
    private String competitionName;
    private String competitionDate;
    private String position; // e.g., "Backend Developer"
    private String experienceTag; // e.g., "Beginner", "Intermediate", "Pro"

    // Team Details
    private String teamName; // This can be updated later!

    // Tracking lists for the team formation
    private List<String> requestedUsernames = new ArrayList<>();
    private List<String> acceptedUsernames = new ArrayList<>();

    // Engagement
    private int like = 0;
    private int dislike = 0;

    // --- GETTERS AND SETTERS ---
    // If you are using Lombok, you can just add @Data at the top of the class and remove these.
    // Otherwise, generate the standard getters and setters for all the fields above!

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getCompetitionName() { return competitionName; }
    public void setCompetitionName(String competitionName) { this.competitionName = competitionName; }

    public String getCompetitionDate() { return competitionDate; }
    public void setCompetitionDate(String competitionDate) { this.competitionDate = competitionDate; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getExperienceTag() { return experienceTag; }
    public void setExperienceTag(String experienceTag) { this.experienceTag = experienceTag; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public List<String> getRequestedUsernames() { return requestedUsernames; }
    public void setRequestedUsernames(List<String> requestedUsernames) { this.requestedUsernames = requestedUsernames; }

    public List<String> getAcceptedUsernames() { return acceptedUsernames; }
    public void setAcceptedUsernames(List<String> acceptedUsernames) { this.acceptedUsernames = acceptedUsernames; }

    public int getLike() { return like; }
    public void setLike(int like) { this.like = like; }

    public int getDislike() { return dislike; }
    public void setDislike(int dislike) { this.dislike = dislike; }
}