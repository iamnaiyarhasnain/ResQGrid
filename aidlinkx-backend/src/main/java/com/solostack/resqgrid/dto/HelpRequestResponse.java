package com.solostack.resqgrid.dto;

import com.solostack.resqgrid.entity.Priority;
import com.solostack.resqgrid.entity.RequestStatus;

public class HelpRequestResponse {

    private Long id;
    private String name;
    private String location;
    private Integer peopleCount;
    private String helpType;
    private Priority priority;
    private String description;
    private String disasterType;
    private String disasterDetails;
    private String contactPhone;
    private String alternateContact;
    private String landmark;
    private String specialNeeds;
    private String photoData;
    private String clientRequestId;
    private RequestStatus status;

    public HelpRequestResponse() {
    }

    public HelpRequestResponse(
            Long id,
            String name,
            String location,
            Integer peopleCount,
            String helpType,
            Priority priority,
            String description,
            String disasterType,
            String disasterDetails,
            String contactPhone,
            String alternateContact,
            String landmark,
            String specialNeeds,
            String photoData,
            String clientRequestId,
            RequestStatus status) {

        this.id = id;
        this.name = name;
        this.location = location;
        this.peopleCount = peopleCount;
        this.helpType = helpType;
        this.priority = priority;
        this.description = description;
        this.disasterType = disasterType;
        this.disasterDetails = disasterDetails;
        this.contactPhone = contactPhone;
        this.alternateContact = alternateContact;
        this.landmark = landmark;
        this.specialNeeds = specialNeeds;
        this.photoData = photoData;
        this.clientRequestId = clientRequestId;
        this.status = status;
    }

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

    public String getDisasterType() { return disasterType; }
    public void setDisasterType(String disasterType) { this.disasterType = disasterType; }

    public String getDisasterDetails() { return disasterDetails; }
    public void setDisasterDetails(String disasterDetails) { this.disasterDetails = disasterDetails; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getAlternateContact() { return alternateContact; }
    public void setAlternateContact(String alternateContact) { this.alternateContact = alternateContact; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getSpecialNeeds() { return specialNeeds; }
    public void setSpecialNeeds(String specialNeeds) { this.specialNeeds = specialNeeds; }

    public String getPhotoData() { return photoData; }
    public void setPhotoData(String photoData) { this.photoData = photoData; }

    public String getClientRequestId() { return clientRequestId; }
    public void setClientRequestId(String clientRequestId) { this.clientRequestId = clientRequestId; }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }
}
