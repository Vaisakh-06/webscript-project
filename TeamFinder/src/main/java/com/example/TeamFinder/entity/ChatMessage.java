//package com.example.TeamFinder.entity;
//
//import org.springframework.data.annotation.Id;
//import org.springframework.data.mongodb.core.mapping.Document;
//
//import java.time.LocalDateTime;
//
//@Document("chat_messages")
//public class gitChatMessage {
//
//    @Id
//    private String id;
//
//    // The ID of the Post/Team this message belongs to
//    private String teamId;
//
//    private String senderUsername;
//    private String content;
//    private LocalDateTime timestamp;
//
//    // Constructors
//    public ChatMessage() {}
//
//    public ChatMessage(String teamId, String senderUsername, String content, LocalDateTime timestamp) {
//        this.teamId = teamId;
//        this.senderUsername = senderUsername;
//        this.content = content;
//        this.timestamp = timestamp;
//    }
//
//    // --- GETTERS AND SETTERS ---
//    public String getId() { return id; }
//    public void setId(String id) { this.id = id; }
//
//    public String getTeamId() { return teamId; }
//    public void setTeamId(String teamId) { this.teamId = teamId; }
//
//    public String getSenderUsername() { return senderUsername; }
//    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }
//
//    public String getContent() { return content; }
//    public void setContent(String content) { this.content = content; }
//
//    public LocalDateTime getTimestamp() { return timestamp; }
//    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
//}