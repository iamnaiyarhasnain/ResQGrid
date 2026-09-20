package com.solostack.resqgrid.service;

import com.solostack.resqgrid.dto.SupplyRequestCreateRequest;
import com.solostack.resqgrid.dto.SupplyRequestMapper;
import com.solostack.resqgrid.dto.SupplyRequestResponse;
import com.solostack.resqgrid.entity.Priority;
import com.solostack.resqgrid.entity.RequestStatus;
import com.solostack.resqgrid.entity.SupplyRequest;
import com.solostack.resqgrid.exception.InvalidStatusTransitionException;
import com.solostack.resqgrid.exception.ResourceNotFoundException;
import com.solostack.resqgrid.repository.SupplyRequestRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


// @Service tells Spring that this class contains
// the business logic of our application.
@Service
public class SupplyRequestService {

    // Repository is responsible for communicating
    // with the MySQL database.
    private final SupplyRequestRepository supplyRequestRepository;


    // Constructor injection.
    //
    // Spring automatically provides the Repository object here.
    public SupplyRequestService(
            SupplyRequestRepository supplyRequestRepository) {

        this.supplyRequestRepository = supplyRequestRepository;
    }


    // =========================================================
    // CREATE REQUEST
    // =========================================================

    // Creates a new supply request.
    //
    // The Controller receives a Create DTO from the client.
    // We convert that DTO into a SupplyRequest Entity.
    // Then we save the Entity into MySQL.
    //
    // The backend automatically sets the initial status
    // to PENDING.
    public SupplyRequestResponse createRequest(
            SupplyRequestCreateRequest request) {

        // Create a new Entity object.
        //
        // Entity represents a record that will be
        // stored in the database.
        SupplyRequest supplyRequest = new SupplyRequest();


        // =====================================================
        // DTO → ENTITY
        // =====================================================

        // Copy Camp ID from DTO to Entity.
        supplyRequest.setCampId(request.getCampId());

        // Copy number of affected people.
        supplyRequest.setPeopleAffected(
                request.getPeopleAffected()
        );

        // Copy water requirement.
        supplyRequest.setWaterQuantity(
                request.getWaterQuantity()
        );

        // Copy food requirement.
        supplyRequest.setFoodQuantity(
                request.getFoodQuantity()
        );

        // Copy medicine requirement.
        supplyRequest.setMedicineQuantity(
                request.getMedicineQuantity()
        );

        // Copy blanket requirement.
        supplyRequest.setBlanketQuantity(
                request.getBlanketQuantity()
        );

        // Copy priority.
        supplyRequest.setPriority(
                request.getPriority()
        );


        // =====================================================
        // SET INITIAL STATUS
        // =====================================================

        // Every newly created request starts as PENDING.
        //
        // The client does NOT decide this value.
        // Our backend controls it.
        supplyRequest.setStatus(
                RequestStatus.PENDING
        );


        // =====================================================
        // SAVE TO DATABASE
        // =====================================================

        // Save the Entity into MySQL.
        //
        // The database will automatically generate the ID.
        SupplyRequest savedRequest =
                supplyRequestRepository.save(supplyRequest);


        // =====================================================
        // ENTITY → RESPONSE DTO
        // =====================================================

        // Convert the saved Entity into a Response DTO.
        //
        // We return the DTO instead of directly exposing
        // our database Entity.
        return SupplyRequestMapper.toResponse(savedRequest);
    }


    // =========================================================
    // GET ALL REQUESTS
    // =========================================================

    // Retrieves all supply requests from the database.
    //
    // The Repository returns Entity objects.
    // We convert every Entity into a Response DTO.
    public List<SupplyRequestResponse> getAllRequests() {

        // Get all requests from MySQL.
        List<SupplyRequest> requests =
                supplyRequestRepository.findAll();


        // Create an empty list to store Response DTOs.
        List<SupplyRequestResponse> responses =
                new ArrayList<>();


        // Convert every Entity → Response DTO.
        for (SupplyRequest request : requests) {

            responses.add(
                    SupplyRequestMapper.toResponse(request)
            );
        }


        // Return the list of DTOs.
        return responses;
    }


    // =========================================================
    // GET REQUEST BY ID
    // =========================================================

    // Retrieves one supply request using its ID.
    public SupplyRequestResponse getRequestById(Long id) {

        // Search the database using the ID.
        //
        // findById() returns Optional because
        // the requested ID may not exist.
        SupplyRequest supplyRequest =
                supplyRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Supply request with ID "
                                                + id
                                                + " not found"
                                )
                        );


        // Convert Entity → Response DTO.
        return SupplyRequestMapper.toResponse(
                supplyRequest
        );
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    // Updates the status of an existing supply request.
    //
    // Allowed workflow:
    //
    // PENDING → ACCEPTED
    // ACCEPTED → DISPATCHED
    // DISPATCHED → DELIVERED
    public SupplyRequestResponse updateStatus(
            Long id,
            RequestStatus newStatus) {


        // Find the request using its ID.
        //
        // If the ID does not exist, throw our custom
        // ResourceNotFoundException.
        SupplyRequest supplyRequest =
                supplyRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Supply request with ID "
                                                + id
                                                + " not found"
                                )
                        );


        // Store the current status before changing it.
        RequestStatus currentStatus =
                supplyRequest.getStatus();


        // =====================================================
        // CHECK STATUS TRANSITION
        // =====================================================

        // Check whether the requested status change
        // follows our predefined workflow.
        boolean validTransition =

                // PENDING → ACCEPTED
                (currentStatus == RequestStatus.PENDING
                        && newStatus == RequestStatus.ACCEPTED)

                        // ACCEPTED → DISPATCHED
                        || (currentStatus == RequestStatus.ACCEPTED
                        && newStatus == RequestStatus.DISPATCHED)

                        // DISPATCHED → DELIVERED
                        || (currentStatus == RequestStatus.DISPATCHED
                        && newStatus == RequestStatus.DELIVERED);


        // If the transition is not allowed,
        // throw our custom exception.
        if (!validTransition) {

            throw new InvalidStatusTransitionException(
                    "Cannot change status from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }


        // =====================================================
        // UPDATE STATUS
        // =====================================================

        // Change the status of the Entity.
        supplyRequest.setStatus(newStatus);


        // Save the updated Entity into MySQL.
        SupplyRequest updatedRequest =
                supplyRequestRepository.save(
                        supplyRequest
                );


        // Convert Entity → Response DTO.
        return SupplyRequestMapper.toResponse(
                updatedRequest
        );
    }


    // =========================================================
// GET REQUESTS BY PRIORITY
// =========================================================

    // Retrieves all requests having a specific priority.
//
// Example:
//
// GET /api/requests/priority/CRITICAL
//
// The Repository returns Entity objects.
// We convert them into Response DTOs before
// returning them to the Controller.
    public List<SupplyRequestResponse> getRequestsByPriority(
            Priority priority) {

        // Get matching requests from the database.
        List<SupplyRequest> requests =
                supplyRequestRepository.findByPriority(
                        priority
                );

        // Create an empty list for Response DTOs.
        List<SupplyRequestResponse> responses =
                new ArrayList<>();

        // Convert each Entity → Response DTO.
        for (SupplyRequest request : requests) {

            responses.add(
                    SupplyRequestMapper.toResponse(request)
            );
        }

        // Return the DTO list.
        return responses;
    }


    // =========================================================
// GET REQUESTS BY PRIORITY + STATUS
// =========================================================

    // Retrieves requests matching BOTH priority and status.
//
// Example:
// GET /api/requests/filter?priority=CRITICAL&status=PENDING
    public List<SupplyRequestResponse> getRequestsByPriorityAndStatus(
            Priority priority,
            RequestStatus status) {

        // Get matching requests from the database.
        List<SupplyRequest> requests =
                supplyRequestRepository.findByPriorityAndStatus(
                        priority,
                        status
                );

        // Create a list to store Response DTOs.
        List<SupplyRequestResponse> responses =
                new ArrayList<>();

        // Convert every Entity → Response DTO.
        for (SupplyRequest request : requests) {

            responses.add(
                    SupplyRequestMapper.toResponse(request)
            );
        }

        // Return the Response DTO list.
        return responses;
    }

    // =========================================================
// GET REQUESTS WITH PAGINATION
// =========================================================

    // Retrieves supply requests page by page.
//
// Pageable contains:
// - page number
// - page size
// - sorting information
//
// Example:
// /api/requests/page?page=0&size=5
//
// The Repository returns a Page of Entities.
// We convert each Entity into a Response DTO.
    public Page<SupplyRequestResponse> getAllRequests(
            Pageable pageable) {

        // Get one page of requests from MySQL.
        Page<SupplyRequest> requestPage =
                supplyRequestRepository.findAll(pageable);

        // Convert every SupplyRequest Entity in the page
        // into a SupplyRequestResponse DTO.
        return requestPage.map(
                SupplyRequestMapper::toResponse
        );
    }
}