package com.solostack.resqgrid.exception;

// This class represents the structure of our error response.
//
// Instead of returning a large default Spring error,
// we return something simple like:
//
// {
//     "message": "Supply request not found",
//     "status": 404
// }
public class ErrorResponse {

    private String message;
    private int status;


    // Constructor used to create an error response
    public ErrorResponse(String message, int status) {
        this.message = message;
        this.status = status;
    }


    // Returns the error message
    public String getMessage() {
        return message;
    }


    // Returns the HTTP status code
    public int getStatus() {
        return status;
    }
}