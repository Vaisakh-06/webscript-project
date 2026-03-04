package com.example.TeamFinder.service;

import com.example.TeamFinder.entity.Event;
import com.example.TeamFinder.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public boolean saveEvent(Event event) {
        try {
            eventRepository.save(event);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean deleteEvent(String id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return true;
        }
        return false;
    }
}