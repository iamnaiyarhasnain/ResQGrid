package com.solostack.resqgrid.controller;

import com.solostack.resqgrid.dto.SupplyRequestCreateRequest;
import com.solostack.resqgrid.dto.SupplyRequestResponse;
import com.solostack.resqgrid.entity.Priority;
import com.solostack.resqgrid.entity.RequestStatus;
import com.solostack.resqgrid.service.SupplyRequestService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
// Tells Spring that this class handles REST API requests
@RestController
// Base URL for all supply-request APIs
@RequestMapping("/api/requests")
public class SupplyRequestController {

    // Controller needs the Service layer
    private final SupplyRequestService supplyRequestService;

    // Constructor Dependency Injection
    public SupplyRequestController(
            SupplyRequestService supplyRequestService) {
        this.supplyRequestService = supplyRequestService;
    }

    // POST /api/requests
// Creates a new supply request.
    @PostMapping
    public SupplyRequestResponse createRequest(
            @Valid @RequestBody SupplyRequestCreateRequest request) {

        return supplyRequestService.createRequest(request);
    }

    // GET /api/requests
// Returns all supply requests.
    @GetMapping
    public List<SupplyRequestResponse> getAllRequests() {

        // Service returns a list of Response DTOs.
        // We send those DTOs to the client.
        return supplyRequestService.getAllRequests();
    }

// GET /api/requests/{id}
// Returns one supply request as a DTO.
    @GetMapping("/{id}")
    public SupplyRequestResponse getRequestById(
            @PathVariable Long id) {

        // Ask the Service for the requested DTO
        return supplyRequestService.getRequestById(id);
    }

 // PATCH /api/requests/{id}/status
//
// Updates the status of a supply request.
    @PatchMapping("/{id}/status")
    public SupplyRequestResponse updateStatus(
            @PathVariable Long id,
            @RequestParam RequestStatus status) {

        // Send the request ID and new status to the Service.
        return supplyRequestService.updateStatus(id, status);
    }

 // GET /api/requests/priority/{priority}
//
// Returns all requests having the specified priority.
    @GetMapping("/priority/{priority}")
    public List<SupplyRequestResponse> getRequestsByPriority(
            @PathVariable Priority priority) {

        // Service returns Response DTOs.
        return supplyRequestService.getRequestsByPriority(
                priority
        );
    }

    // GET /api/requests/filter?priority=CRITICAL&status=PENDING
//
// Returns requests matching both priority and status.
    @GetMapping("/filter")
    public List<SupplyRequestResponse> getRequestsByPriorityAndStatus(
            @RequestParam Priority priority,
            @RequestParam RequestStatus status) {

        // Service returns Response DTOs.
        return supplyRequestService
                .getRequestsByPriorityAndStatus(
                        priority,
                        status
                );
    }

    // GET /api/requests/page?page=0&size=5
//
// Returns requests page by page using Response DTOs.
    @GetMapping("/page")
    public Page<SupplyRequestResponse> getRequestsWithPagination(
            Pageable pageable) {

        // Send pagination information to the Service.
        return supplyRequestService.getAllRequests(pageable);
    }


}