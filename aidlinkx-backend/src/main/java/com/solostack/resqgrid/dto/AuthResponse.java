package com.solostack.resqgrid.dto;

import java.time.Instant;

public class AuthResponse {
    private String token;
    private Instant expiresAt;
    private UserResponse user;

    public AuthResponse(String token, Instant expiresAt, UserResponse user) {
        this.token = token;
        this.expiresAt = expiresAt;
        this.user = user;
    }

    public String getToken() { return token; }
    public Instant getExpiresAt() { return expiresAt; }
    public UserResponse getUser() { return user; }
}
