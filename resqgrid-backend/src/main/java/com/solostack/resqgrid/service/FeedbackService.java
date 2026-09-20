package com.solostack.resqgrid.service;

import com.solostack.resqgrid.dto.FeedbackCreateRequest;
import com.solostack.resqgrid.entity.Feedback;
import com.solostack.resqgrid.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public Feedback submit(FeedbackCreateRequest request) {
        Feedback feedback = new Feedback();
        feedback.setName(blankToNull(request.getName()));
        feedback.setEmail(blankToNull(request.getEmail()));
        feedback.setRating(request.getRating());
        feedback.setMessage(request.getMessage().trim());
        feedback.setCreatedAt(Instant.now());
        return feedbackRepository.save(feedback);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
