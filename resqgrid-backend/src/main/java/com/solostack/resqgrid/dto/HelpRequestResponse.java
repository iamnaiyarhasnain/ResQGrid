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
            RequestStatus status) {

        this.id = id;
        this.name = name;
        this.location = location;
        this.peopleCount = peopleCount;
        this.helpType = helpType;
        this.priority = priority;
        this.description = description;
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

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }
}