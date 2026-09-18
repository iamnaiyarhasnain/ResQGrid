package com.solostack.resqgrid.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "help_requests")
public class HelpRequest {

    // Unique ID generated automatically by MySQL
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Name of the person requesting help
    @NotBlank(message = "Name is required")
    private String name;

    // Area/location where help is needed
    @NotBlank(message = "Location is required")
    private String location;

    // Number of people needing help
    @NotNull(message = "Number of people is required")
    @Positive(message = "Number of people must be greater than 0")
    private Integer peopleCount;

    // Type of help required
    @NotBlank(message = "Help type is required")
    private String helpType;

    // Priority of the request
    @NotNull(message = "Priority is required")
    @Enumerated(EnumType.STRING)
    private Priority priority;

    // Short description of the problem
    @NotBlank(message = "Description is required")
    private String description;

    // Current status of the request
    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    // Required by JPA
    public HelpRequest() {
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getPeopleCount() {
        return peopleCount;
    }

    public void setPeopleCount(Integer peopleCount) {
        this.peopleCount = peopleCount;
    }

    public String getHelpType() {
        return helpType;
    }

    public void setHelpType(String helpType) {
        this.helpType = helpType;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }
}