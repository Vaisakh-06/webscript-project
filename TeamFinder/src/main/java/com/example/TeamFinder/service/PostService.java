package com.example.TeamFinder.service;

import com.example.TeamFinder.entity.Post;
import com.example.TeamFinder.entity.User;
import com.example.TeamFinder.repository.PostRepository;
import com.example.TeamFinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public boolean savePost(Post post) {
        Post savedPost = postRepository.save(post);

        Optional<User> userOpt = userRepository.findByUsername(post.getUsername());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Prevent NullPointerException
            if (user.getPosts() == null) {
                user.setPosts(new ArrayList<>());
            }
            user.getPosts().add(savedPost.getId());
            userRepository.save(user); // CRITICAL FIX: Save the user to update their post list!
            return true;
        }
        return false;
    }

    public boolean deletePost(String postId) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();

            // Remove the post ID from the User's list so it doesn't become orphaned
            Optional<User> userOpt = userRepository.findByUsername(post.getUsername());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getPosts() != null) {
                    user.getPosts().remove(postId);
                    userRepository.save(user);
                }
            }

            postRepository.delete(post);
            return true;
        }
        return false;
    }

    // Note: To prevent infinite liking/disliking, you should eventually
    // track WHO liked the post, just like we did with User profiles!
    public boolean like(String postId) {
        Optional<Post> byId = postRepository.findById(postId);
        if (byId.isPresent()) {
            Post post = byId.get();
            post.setLike(post.getLike() + 1);
            postRepository.save(post);
            return true;
        }
        return false;
    }

    public boolean dislike(String postId) {
        Optional<Post> byId = postRepository.findById(postId);
        if (byId.isPresent()) {
            Post post = byId.get();
            post.setDislike(post.getDislike() + 1);
            postRepository.save(post);
            return true;
        }
        return false;
    }

    // ... (Keep your existing savePost, deletePost, like, and dislike methods) ...

    // 1. Fetch all posts so we can display them on a "Feed" page
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // 2. A user sends a request to join a team
    public boolean requestToJoin(String postId, String requesterUsername) {
        Optional<Post> postOpt = postRepository.findById(postId);

        if (postOpt.isPresent()) {
            Post post = postOpt.get();

            // Initialize lists if they are null (safety check)
            if (post.getRequestedUsernames() == null) post.setRequestedUsernames(new ArrayList<>());
            if (post.getAcceptedUsernames() == null) post.setAcceptedUsernames(new ArrayList<>());

            // Prevent the owner from requesting to join their own team
            if (post.getUsername().equals(requesterUsername)) {
                return false;
            }

            // Prevent duplicate requests or requesting if already accepted
            if (post.getRequestedUsernames().contains(requesterUsername) ||
                    post.getAcceptedUsernames().contains(requesterUsername)) {
                return false;
            }

            post.getRequestedUsernames().add(requesterUsername);
            postRepository.save(post);
            return true;
        }
        return false;
    }

    // 3. The owner accepts a join request
    public boolean acceptRequest(String postId, String ownerUsername, String targetUsername) {
        Optional<Post> postOpt = postRepository.findById(postId);

        if (postOpt.isPresent()) {
            Post post = postOpt.get();

            // Authorization Check: Only the post creator can accept members
            if (!post.getUsername().equals(ownerUsername)) {
                return false;
            }

            // Move the user from 'requested' to 'accepted'
            if (post.getRequestedUsernames() != null && post.getRequestedUsernames().contains(targetUsername)) {
                post.getRequestedUsernames().remove(targetUsername);

                if (post.getAcceptedUsernames() == null) post.setAcceptedUsernames(new ArrayList<>());
                post.getAcceptedUsernames().add(targetUsername);

                postRepository.save(post);
                return true;
            }
        }
        return false;
    }

    // 4. The owner rejects a join request
    public boolean rejectRequest(String postId, String ownerUsername, String targetUsername) {
        Optional<Post> postOpt = postRepository.findById(postId);

        if (postOpt.isPresent()) {
            Post post = postOpt.get();

            // Authorization Check
            if (!post.getUsername().equals(ownerUsername)) {
                return false;
            }

            // Remove the user from the requested list
            if (post.getRequestedUsernames() != null) {
                post.getRequestedUsernames().remove(targetUsername);
                postRepository.save(post);
                return true;
            }
        }
        return false;
    }
}