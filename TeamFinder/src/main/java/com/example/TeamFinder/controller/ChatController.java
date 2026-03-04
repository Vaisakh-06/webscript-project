package com.example.TeamFinder.controller;

import com.example.TeamFinder.entity.ChatMessage;
import com.example.TeamFinder.entity.Post;
import com.example.TeamFinder.entity.PrivateMessage;
import com.example.TeamFinder.service.ChatService;
import com.example.TeamFinder.service.PrivateMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private PrivateMessageService privateMessageService;

    @GetMapping("/my-teams")
    public ResponseEntity<?> getMyTeams(Authentication authentication) {
        String username = authentication.getName();
        List<Post> teams = chatService.getMyTeams(username);
        return new ResponseEntity<>(teams, HttpStatus.OK);
    }

    @GetMapping("/{teamId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String teamId, Authentication authentication) {
        String username = authentication.getName();
        Optional<List<ChatMessage>> messages = chatService.getMessages(teamId, username);
        if (messages.isEmpty()) {
            return new ResponseEntity<>("Team not found or access denied", HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(messages.get(), HttpStatus.OK);
    }

    @PostMapping("/{teamId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable String teamId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {

        String username = authentication.getName();
        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return new ResponseEntity<>("Message content cannot be empty", HttpStatus.BAD_REQUEST);
        }
        Optional<ChatMessage> message = chatService.sendMessage(teamId, username, content);
        if (message.isEmpty()) {
            return new ResponseEntity<>("Cannot send message to this team", HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(message.get(), HttpStatus.OK);
    }

    @GetMapping("/private/conversations")
    public ResponseEntity<?> getPrivateConversations(Authentication authentication) {
        String username = authentication.getName();
        return new ResponseEntity<>(privateMessageService.getConversations(username), HttpStatus.OK);
    }

    @GetMapping("/private/{otherUsername}/messages")
    public ResponseEntity<?> getPrivateMessages(
            @PathVariable String otherUsername,
            Authentication authentication) {
        String username = authentication.getName();
        Optional<List<PrivateMessage>> messages = privateMessageService.getMessages(username, otherUsername);
        if (messages.isEmpty()) {
            return new ResponseEntity<>("Conversation not available", HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(messages.get(), HttpStatus.OK);
    }

    @PostMapping("/private/{otherUsername}/messages")
    public ResponseEntity<?> sendPrivateMessage(
            @PathVariable String otherUsername,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String username = authentication.getName();
        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return new ResponseEntity<>("Message content cannot be empty", HttpStatus.BAD_REQUEST);
        }

        Optional<PrivateMessage> message = privateMessageService.sendPrivateMessage(username, otherUsername, content);
        if (message.isEmpty()) {
            return new ResponseEntity<>("Cannot send private message", HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(message.get(), HttpStatus.OK);
    }
}
