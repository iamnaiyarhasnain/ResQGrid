package com.solostack.resqgrid.dto;

import com.solostack.resqgrid.entity.Priority;
import com.solostack.resqgrid.entity.RequestStatus;

// DTO = Data Transfer Object
// This class represents the data that we want
// to send from our backend to the frontend.
// It is separate from our database Entity.
public class SupplyRequestResponse {

    private Long id;

    private String campId;

    private Integer peopleAffected;

    private Integer waterQuantity;

    private Integer foodQuantity;

    private Integer medicineQuantity;

    private Integer blanketQuantity;

    private Priority priority;

    private RequestStatus status;


    // No-argument constructor
    public SupplyRequestResponse() {
    }


    // Constructor used to convert Entity data into DTO data
    public SupplyRequestResponse(
            Long id,
            String campId,
            Integer peopleAffected,
            Integer waterQuantity,
            Integer foodQuantity,
            Integer medicineQuantity,
            Integer blanketQuantity,
            Priority priority,
            RequestStatus status) {

        this.id = id;
        this.campId = campId;
        this.peopleAffected = peopleAffected;
        this.waterQuantity = waterQuantity;
        this.foodQuantity = foodQuantity;
        this.medicineQuantity = medicineQuantity;
        this.blanketQuantity = blanketQuantity;
        this.priority = priority;
        this.status = status;
    }


    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCampId() {
        return campId;
    }

    public void setCampId(String campId) {
        this.campId = campId;
    }

    public Integer getPeopleAffected() {
        return peopleAffected;
    }

    public void setPeopleAffected(Integer peopleAffected) {
        this.peopleAffected = peopleAffected;
    }

    public Integer getWaterQuantity() {
        return waterQuantity;
    }

    public void setWaterQuantity(Integer waterQuantity) {
        this.waterQuantity = waterQuantity;
    }

    public Integer getFoodQuantity() {
        return foodQuantity;
    }

    public void setFoodQuantity(Integer foodQuantity) {
        this.foodQuantity = foodQuantity;
    }

    public Integer getMedicineQuantity() {
        return medicineQuantity;
    }

    public void setMedicineQuantity(Integer medicineQuantity) {
        this.medicineQuantity = medicineQuantity;
    }

    public Integer getBlanketQuantity() {
        return blanketQuantity;
    }

    public void setBlanketQuantity(Integer blanketQuantity) {
        this.blanketQuantity = blanketQuantity;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }
}