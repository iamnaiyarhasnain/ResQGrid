package com.solostack.resqgrid.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
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

    // Disaster context lets responders prepare the right type of support.
    @Column(length = 60)
    private String disasterType;

    @Column(length = 500)
    private String disasterDetails;

    // User contact and vulnerability information
    @Column(length = 30)
    private String contactPhone;

    @Column(length = 30)
    private String alternateContact;

    @Column(length = 255)
    private String landmark;

    @Column(length = 255)
    private String specialNeeds;

    // Optional reference image, capped by the API before it is persisted.
    @Lob
    private String photoData;

    // A client generated ID makes offline retries idempotent.
    @Column(unique = true, length = 64)
    private String clientRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private AppUser createdBy;

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

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getAlternateContact() { return alternateContact; }
    public void setAlternateContact(String alternateContact) { this.alternateContact = alternateContact; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getSpecialNeeds() { return specialNeeds; }
    public void setSpecialNeeds(String specialNeeds) { this.specialNeeds = specialNeeds; }

    public String getDisasterType() { return disasterType; }
    public void setDisasterType(String disasterType) { this.disasterType = disasterType; }

    public String getDisasterDetails() { return disasterDetails; }
    public void setDisasterDetails(String disasterDetails) { this.disasterDetails = disasterDetails; }

    public String getPhotoData() { return photoData; }
    public void setPhotoData(String photoData) { this.photoData = photoData; }

    public String getClientRequestId() { return clientRequestId; }
    public void setClientRequestId(String clientRequestId) { this.clientRequestId = clientRequestId; }

    public AppUser getCreatedBy() { return createdBy; }
    public void setCreatedBy(AppUser createdBy) { this.createdBy = createdBy; }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }
}
