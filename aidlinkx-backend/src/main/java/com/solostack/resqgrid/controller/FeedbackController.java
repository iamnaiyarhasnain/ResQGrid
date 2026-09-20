package com.solostack.resqgrid.controller;

import com.solostack.resqgrid.dto.FeedbackCreateRequest;
import com.solostack.resqgrid.entity.Feedback;
import com.solostack.resqgrid.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Feedback submit(@Valid @RequestBody FeedbackCreateRequest request) {
        return feedbackService.submit(request);
    }

    @org.springframework.web.bind.annotation.GetMapping
    public java.util.List<Feedback> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }
}
