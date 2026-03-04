package com.example.TeamFinder.repository;

import com.example.TeamFinder.entity.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByUsername(String s);
    List<User> findByName(String name);
    List<User> findBySkill(String skill);
}
