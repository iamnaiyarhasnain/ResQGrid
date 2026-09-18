package com.solostack.resqgrid.exception;

// Custom exception used when someone tries
// to make an invalid status change.
//
// Example:
//
// PENDING → DELIVERED ❌
//
// Instead, the correct flow is:
//
// PENDING → ACCEPTED → DISPATCHED → DELIVERED
public class InvalidStatusTransitionException
        extends RuntimeException {

    // Constructor receives the error message
    public InvalidStatusTransitionException(String message) {

        // Pass the message to RuntimeException
        super(message);
    }
}