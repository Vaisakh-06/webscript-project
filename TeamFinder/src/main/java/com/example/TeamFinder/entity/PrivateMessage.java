package com.example.TeamFinder.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document("private_messages")
public class PrivateMessage {

    @Id
    private String id;
    private String participantsKey;
    private String senderUsername;
    private String receiverUsername;
    private String content;
    private LocalDateTime timestamp;

    public PrivateMessage() {}

    public PrivateMessage(String participantsKey, String senderUsername, String receiverUsername, String content, LocalDateTime timestamp) {
        this.participantsKey = participantsKey;
        this.senderUsername = senderUsername;
        this.receiverUsername = receiverUsername;
        this.content = content;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getParticipantsKey() { return participantsKey; }
    public void setParticipantsKey(String participantsKey) { this.participantsKey = participantsKey; }

    public String getSenderUsername() { return senderUsername; }
    public void setSenderUsername(String senderUsername) { this.senderUsername = senderUsername; }

    public String getReceiverUsername() { return receiverUsername; }
    public void setReceiverUsername(String receiverUsername) { this.receiverUsername = receiverUsername; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
