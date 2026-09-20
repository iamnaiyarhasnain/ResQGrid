package com.solostack.resqgrid.entity;

// Represents the current stage of a supply request
public enum RequestStatus {

    // Request has been created but not yet reviewed
    PENDING,

    // Coordinator has accepted the request
    ACCEPTED,

    // Required supplies have been sent
    DISPATCHED,

    // Camp has received the supplies
    DELIVERED
}