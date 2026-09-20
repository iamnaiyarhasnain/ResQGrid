package com.solostack.resqgrid.dto;

import com.solostack.resqgrid.entity.UserRole;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Email or phone is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;

    private UserRole requestedRole;

    private String securityKey;

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public UserRole getRequestedRole() { return requestedRole; }
    public void setRequestedRole(UserRole requestedRole) { this.requestedRole = requestedRole; }
    public String getSecurityKey() { return securityKey; }
    public void setSecurityKey(String securityKey) { this.securityKey = securityKey; }
}
