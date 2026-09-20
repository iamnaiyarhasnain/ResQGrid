package com.solostack.resqgrid.controller;

import com.solostack.resqgrid.dto.HelpRequestCreateRequest;
import com.solostack.resqgrid.dto.HelpRequestResponse;
import com.solostack.resqgrid.entity.RequestStatus;
import com.solostack.resqgrid.entity.AppUser;
import com.solostack.resqgrid.service.AuthService;
import com.solostack.resqgrid.service.HelpRequestService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/help-requests")
public class HelpRequestController {

    private final HelpRequestService helpRequestService;
    private final AuthService authService;

    public HelpRequestController(
            HelpRequestService helpRequestService,
            AuthService authService) {

        this.helpRequestService = helpRequestService;
        this.authService = authService;
    }

    // Resident submits a new help request
    @PostMapping
    public HelpRequestResponse createHelpRequest(
            @Valid @RequestBody HelpRequestCreateRequest request,
            @RequestHeader(value = "Authorization", required = false)
            String authorization) {

        AppUser submittedBy = authService.optionalUser(authorization);
        return helpRequestService.createRequest(request, submittedBy);
    }

    // Get all resident help requests
    @GetMapping
    public List<HelpRequestResponse> getAllHelpRequests(
            @RequestHeader(value = "Authorization", required = false) String authorization) {

        if (authorization == null || authorization.isBlank()) {
            return java.util.Collections.emptyList();
        }

        authService.requireCoordinator(authorization);

        return helpRequestService.getAllRequests();
    }

    // Coordinator changes request status
    @PatchMapping("/{id}/status")
    public HelpRequestResponse updateStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status,
            @RequestHeader("Authorization") String authorization) {

        authService.requireCoordinator(authorization);

        return helpRequestService.updateStatus(
                id,
                status
        );
    }
}
