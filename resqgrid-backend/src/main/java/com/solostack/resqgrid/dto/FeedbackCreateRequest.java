package com.solostack.resqgrid.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FeedbackCreateRequest {
    @Size(max = 120, message = "Name must be 120 characters or fewer")
    private String name;
    @Size(max = 180, message = "Email must be 180 characters or fewer")
    private String email;
    @Min(value = 1, message = "Rating must be from 1 to 5")
    @Max(value = 5, message = "Rating must be from 1 to 5")
    private Integer rating;
    @NotBlank(message = "Feedback message is required")
    @Size(max = 1200, message = "Feedback must be 1200 characters or fewer")
    private String message;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
