package com.solostack.resqgrid.controller;

import com.solostack.resqgrid.dto.HelpRequestCreateRequest;
import com.solostack.resqgrid.dto.HelpRequestResponse;
import com.solostack.resqgrid.entity.RequestStatus;
import com.solostack.resqgrid.service.HelpRequestService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/help-requests")
public class HelpRequestController {

    private final HelpRequestService helpRequestService;

    public HelpRequestController(
            HelpRequestService helpRequestService) {

        this.helpRequestService = helpRequestService;
    }

    // Resident submits a new help request
    @PostMapping
    public HelpRequestResponse createHelpRequest(
            @Valid @RequestBody HelpRequestCreateRequest request) {

        return helpRequestService.createRequest(request);
    }

    // Get all resident help requests
    @GetMapping
    public List<HelpRequestResponse> getAllHelpRequests() {

        return helpRequestService.getAllRequests();
    }

    // Coordinator changes request status
    @PatchMapping("/{id}/status")
    public HelpRequestResponse updateStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status) {

        return helpRequestService.updateStatus(
                id,
                status
        );
    }
}