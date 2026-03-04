package com.example.TeamFinder.websocket;

import com.example.TeamFinder.entity.ChatMessage;
import com.example.TeamFinder.service.ChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TeamChatWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, Set<WebSocketSession>> teamSubscribers = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> sessionTeams = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private ChatService chatService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String username = getUsername(session);
        if (username == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String username = getUsername(session);
        if (username == null) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Unauthorized"));
            return;
        }

        JsonNode payload = objectMapper.readTree(message.getPayload());
        String type = payload.path("type").asText("");

        if ("subscribe".equals(type)) {
            handleSubscribe(session, username, payload);
            return;
        }

        if ("message".equals(type)) {
            handleChatMessage(session, username, payload);
            return;
        }

        sendError(session, "Unknown message type");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Set<String> teams = sessionTeams.remove(session.getId());
        if (teams != null) {
            for (String teamId : teams) {
                Set<WebSocketSession> subscribers = teamSubscribers.get(teamId);
                if (subscribers != null) {
                    subscribers.remove(session);
                    if (subscribers.isEmpty()) {
                        teamSubscribers.remove(teamId);
                    }
                }
            }
        }
    }

    private void handleSubscribe(WebSocketSession session, String username, JsonNode payload) throws IOException {
        String teamId = payload.path("teamId").asText("").trim();
        if (teamId.isEmpty()) {
            sendError(session, "Missing teamId");
            return;
        }

        if (!chatService.canAccessTeam(teamId, username)) {
            sendError(session, "Access denied for this team");
            return;
        }

        teamSubscribers.computeIfAbsent(teamId, key -> ConcurrentHashMap.newKeySet()).add(session);
        sessionTeams.computeIfAbsent(session.getId(), key -> ConcurrentHashMap.newKeySet()).add(teamId);

        sendJson(session, Map.of("type", "subscribed", "teamId", teamId));
    }

    private void handleChatMessage(WebSocketSession session, String username, JsonNode payload) throws IOException {
        String teamId = payload.path("teamId").asText("").trim();
        String content = payload.path("content").asText("").trim();

        if (teamId.isEmpty() || content.isEmpty()) {
            sendError(session, "teamId and content are required");
            return;
        }

        Optional<ChatMessage> saved = chatService.sendMessage(teamId, username, content);
        if (saved.isEmpty()) {
            sendError(session, "Cannot send message to this team");
            return;
        }

        Set<WebSocketSession> subscribers = teamSubscribers.get(teamId);
        if (subscribers == null || subscribers.isEmpty()) {
            return;
        }

        String json = objectMapper.writeValueAsString(Map.of(
                "type", "message",
                "teamId", teamId,
                "message", saved.get()
        ));

        for (WebSocketSession subscriber : subscribers) {
            if (subscriber.isOpen()) {
                subscriber.sendMessage(new TextMessage(json));
            }
        }
    }

    private String getUsername(WebSocketSession session) {
        Object value = session.getAttributes().get("username");
        return value instanceof String ? (String) value : null;
    }

    private void sendError(WebSocketSession session, String error) throws IOException {
        sendJson(session, Map.of("type", "error", "message", error));
    }

    private void sendJson(WebSocketSession session, Map<String, Object> payload) throws IOException {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
        }
    }
}
