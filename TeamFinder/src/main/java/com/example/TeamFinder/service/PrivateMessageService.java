package com.example.TeamFinder.service;

import com.example.TeamFinder.entity.PrivateMessage;
import com.example.TeamFinder.entity.User;
import com.example.TeamFinder.repository.PrivateMessageRepository;
import com.example.TeamFinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PrivateMessageService {

    @Autowired
    private PrivateMessageRepository privateMessageRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<PrivateMessage> sendPrivateMessage(String senderUsername, String receiverUsername, String content) {
        String sender = resolveCanonicalUsername(senderUsername);
        String receiver = resolveCanonicalUsername(receiverUsername);
        String trimmedContent = content == null ? "" : content.trim();

        if (sender == null || receiver == null || sender.equalsIgnoreCase(receiver) || trimmedContent.isEmpty()) {
            return Optional.empty();
        }

        String key = conversationKey(sender, receiver);
        PrivateMessage message = new PrivateMessage(key, sender, receiver, trimmedContent, LocalDateTime.now());
        return Optional.of(privateMessageRepository.save(message));
    }

    public Optional<List<PrivateMessage>> getMessages(String myUsername, String otherUsername) {
        String me = resolveCanonicalUsername(myUsername);
        String other = resolveCanonicalUsername(otherUsername);
        if (me == null || other == null || me.equalsIgnoreCase(other)) {
            return Optional.empty();
        }
        return Optional.of(privateMessageRepository.findByParticipantsKeyOrderByTimestampAsc(conversationKey(me, other)));
    }

    public List<Map<String, Object>> getConversations(String myUsername) {
        String me = resolveCanonicalUsername(myUsername);
        if (me == null) return List.of();

        List<PrivateMessage> all = privateMessageRepository.findBySenderUsernameOrReceiverUsernameOrderByTimestampDesc(me, me);
        Map<String, PrivateMessage> latestByKey = new LinkedHashMap<>();
        for (PrivateMessage message : all) {
            latestByKey.putIfAbsent(message.getParticipantsKey(), message);
        }

        return latestByKey.values().stream().map(message -> {
            String other = message.getSenderUsername().equalsIgnoreCase(me)
                    ? message.getReceiverUsername()
                    : message.getSenderUsername();

            Map<String, Object> row = new HashMap<>();
            row.put("otherUsername", other);
            row.put("lastContent", message.getContent());
            row.put("lastTimestamp", message.getTimestamp());
            row.put("participantsKey", message.getParticipantsKey());
            return row;
        }).collect(Collectors.toList());
    }

    public boolean canOpenConversation(String myUsername, String otherUsername) {
        String me = resolveCanonicalUsername(myUsername);
        String other = resolveCanonicalUsername(otherUsername);
        return me != null && other != null && !me.equalsIgnoreCase(other);
    }

    public String getConversationKey(String usernameA, String usernameB) {
        String first = normalize(usernameA);
        String second = normalize(usernameB);
        if (first.compareTo(second) <= 0) {
            return first + "::" + second;
        }
        return second + "::" + first;
    }

    private String conversationKey(String usernameA, String usernameB) {
        return getConversationKey(usernameA, usernameB);
    }

    private String resolveCanonicalUsername(String username) {
        String normalized = normalize(username);
        Optional<User> match = userRepository.findAll().stream()
                .filter(user -> normalize(user.getUsername()).equals(normalized))
                .findFirst();
        return match.map(User::getUsername).orElse(null);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
