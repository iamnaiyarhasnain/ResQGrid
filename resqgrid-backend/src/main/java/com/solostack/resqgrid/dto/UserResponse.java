package com.solostack.resqgrid.dto;

import com.solostack.resqgrid.entity.AppUser;
import com.solostack.resqgrid.entity.UserRole;

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;

    public UserResponse() { }

    public UserResponse(AppUser user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public UserRole getRole() { return role; }
}
