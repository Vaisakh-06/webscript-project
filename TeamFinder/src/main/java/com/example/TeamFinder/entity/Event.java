package com.example.TeamFinder.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("events")
public class Event {

    @Id
    private String id;

    private String heading;      // e.g., "Annual Spring Hackathon"
    private String date;         // e.g., "2026-04-15"
    private String description;  // Full details
    private int maxTeamSize;     // e.g., 4
    private String prizePool;    // e.g., "$5,000"
    private String venue;        // e.g., "Main Auditorium"

    private String postedBy;     // Username of the President who posted it
    private String clubName;     // e.g., "Computer Science Society"

    // --- Generate Getters and Setters here ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getHeading() { return heading; }
    public void setHeading(String heading) { this.heading = heading; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(int maxTeamSize) { this.maxTeamSize = maxTeamSize; }
    public String getPrizePool() { return prizePool; }
    public void setPrizePool(String prizePool) { this.prizePool = prizePool; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }
    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }
}