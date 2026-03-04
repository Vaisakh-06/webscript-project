package com.example.TeamFinder.service;

import com.example.TeamFinder.entity.ChatMessage;
import com.example.TeamFinder.entity.Post;
import com.example.TeamFinder.entity.User;
import com.example.TeamFinder.repository.ChatMessageRepository;
import com.example.TeamFinder.repository.PostRepository;
import com.example.TeamFinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Post> getMyTeams(String username) {
        Optional<User> userOpt = resolveUserByUsernameLoose(username);
        Set<String> myPostIds = new HashSet<>();
        if (userOpt.isPresent() && userOpt.get().getPosts() != null) {
            myPostIds.addAll(userOpt.get().getPosts());
        }

        List<Post> allPosts = postRepository.findAll();
        return allPosts.stream()
                .filter(post -> myPostIds.contains(post.getId()) || isTeamMember(post, username))
                .collect(Collectors.toList());
    }

    public Optional<List<ChatMessage>> getMessages(String teamId, String username) {
        Optional<Post> postOpt = postRepository.findById(teamId);
        if (postOpt.isEmpty() || !isTeamMember(postOpt.get(), username)) {
            return Optional.empty();
        }
        return Optional.of(chatMessageRepository.findByTeamIdOrderByTimestampAsc(teamId));
    }

    public Optional<ChatMessage> sendMessage(String teamId, String username, String content) {
        Optional<Post> postOpt = postRepository.findById(teamId);
        if (postOpt.isEmpty() || !isTeamMember(postOpt.get(), username)) {
            return Optional.empty();
        }

        String trimmedContent = content == null ? "" : content.trim();
        if (trimmedContent.isEmpty()) {
            return Optional.empty();
        }

        ChatMessage message = new ChatMessage(teamId, username, trimmedContent, LocalDateTime.now());
        ChatMessage saved = chatMessageRepository.save(message);
        return Optional.of(saved);
    }

    private boolean isTeamMember(Post post, String username) {
        if (matchesUser(post.getUsername(), username)) {
            return true;
        }
        return post.getAcceptedUsernames() != null
                && post.getAcceptedUsernames().stream().anyMatch(member -> matchesUser(member, username));
    }

    private boolean matchesUser(String first, String second) {
        return normalize(first).equals(normalize(second));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private Optional<User> resolveUserByUsernameLoose(String username) {
        String target = normalize(username);
        return userRepository.findAll().stream()
                .filter(user -> normalize(user.getUsername()).equals(target))
                .findFirst();
    }
}
