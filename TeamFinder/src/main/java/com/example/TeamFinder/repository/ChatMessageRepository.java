//package com.example.TeamFinder.repository;
//
//import com.example.TeamFinder.entity.ChatMessage;
//import org.springframework.data.mongodb.repository.MongoRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
//
//    // This will let us easily grab all chat history for a specific team, ordered by time
//    List<ChatMessage> findByTeamIdOrderByTimestampAsc(String teamId);
//}