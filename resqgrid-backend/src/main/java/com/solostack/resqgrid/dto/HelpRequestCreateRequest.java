package com.solostack.resqgrid.dto;

import com.solostack.resqgrid.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class HelpRequestCreateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Number of people is required")
    @Positive(message = "Number of people must be greater than 0")
    private Integer peopleCount;

    @NotBlank(message = "Help type is required")
    private String helpType;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Disaster type is required")
    private String disasterType;

    private String disasterDetails;

    private String photoData;

    @NotBlank(message = "Client request ID is required")
    private String clientRequestId;

    public HelpRequestCreateRequest() {
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

    public String getDisasterType() { return disasterType; }
    public void setDisasterType(String disasterType) { this.disasterType = disasterType; }

    public String getDisasterDetails() { return disasterDetails; }
    public void setDisasterDetails(String disasterDetails) { this.disasterDetails = disasterDetails; }

    public String getPhotoData() { return photoData; }
    public void setPhotoData(String photoData) { this.photoData = photoData; }

    public String getClientRequestId() { return clientRequestId; }
    public void setClientRequestId(String clientRequestId) { this.clientRequestId = clientRequestId; }
}
