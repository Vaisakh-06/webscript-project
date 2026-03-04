package com.example.TeamFinder.repository;

import com.example.TeamFinder.entity.PrivateMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivateMessageRepository extends MongoRepository<PrivateMessage, String> {
    List<PrivateMessage> findByParticipantsKeyOrderByTimestampAsc(String participantsKey);
    List<PrivateMessage> findBySenderUsernameOrReceiverUsernameOrderByTimestampDesc(String senderUsername, String receiverUsername);
}
