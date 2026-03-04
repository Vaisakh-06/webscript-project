package com.example.TeamFinder.service;

import org.springframework.stereotype.Service;

@Service
public class PublicService {
    public String healthCheck()
    {
        return "OK";
    }
}
