package com.example.TeamFinder.config;

import com.example.TeamFinder.websocket.ChatHandshakeInterceptor;
import com.example.TeamFinder.websocket.TeamChatWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private TeamChatWebSocketHandler teamChatWebSocketHandler;

    @Autowired
    private ChatHandshakeInterceptor chatHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(teamChatWebSocketHandler, "/ws-chat")
                .addInterceptors(chatHandshakeInterceptor)
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000");
    }
}
