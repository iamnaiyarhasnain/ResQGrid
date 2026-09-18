package com.solostack.resqgrid.exception;

// Custom exception used when a requested resource
// does not exist in the database.
//
// Example:
// GET /api/requests/999
//
// If request 999 doesn't exist,
// we throw this exception.
public class ResourceNotFoundException
        extends RuntimeException {

    // Constructor receives the error message
    public ResourceNotFoundException(String message) {

        // Pass the message to RuntimeException
        super(message);
    }
}