package com.solostack.resqgrid.service;

import com.solostack.resqgrid.dto.HelpRequestCreateRequest;
import com.solostack.resqgrid.dto.HelpRequestResponse;
import com.solostack.resqgrid.entity.HelpRequest;
import com.solostack.resqgrid.entity.RequestStatus;
import com.solostack.resqgrid.exception.InvalidStatusTransitionException;
import com.solostack.resqgrid.exception.ResourceNotFoundException;
import com.solostack.resqgrid.repository.HelpRequestRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HelpRequestService {

    private final HelpRequestRepository helpRequestRepository;

    public HelpRequestService(
            HelpRequestRepository helpRequestRepository) {

        this.helpRequestRepository = helpRequestRepository;
    }

    // Create a new request from a resident
    public HelpRequestResponse createRequest(
            HelpRequestCreateRequest request) {

        HelpRequest helpRequest = new HelpRequest();

        helpRequest.setName(request.getName());
        helpRequest.setLocation(request.getLocation());
        helpRequest.setPeopleCount(request.getPeopleCount());
        helpRequest.setHelpType(request.getHelpType());
        helpRequest.setPriority(request.getPriority());
        helpRequest.setDescription(request.getDescription());

        // Every new request starts as PENDING
        helpRequest.setStatus(RequestStatus.PENDING);

        HelpRequest savedRequest =
                helpRequestRepository.save(helpRequest);

        return toResponse(savedRequest);
    }

    // Get all resident requests
    public List<HelpRequestResponse> getAllRequests() {

        List<HelpRequest> requests =
                helpRequestRepository.findAll();

        List<HelpRequestResponse> responses =
                new ArrayList<>();

        for (HelpRequest request : requests) {
            responses.add(toResponse(request));
        }

        return responses;
    }

    // Update the status of a resident request
    public HelpRequestResponse updateStatus(
            Long id,
            RequestStatus newStatus) {

        HelpRequest helpRequest =
                helpRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Help request with ID "
                                                + id
                                                + " not found"));

        RequestStatus currentStatus =
                helpRequest.getStatus();

        // Only allow the correct workflow
        boolean validTransition =
                (currentStatus == RequestStatus.PENDING
                        && newStatus == RequestStatus.ACCEPTED)

                        || (currentStatus == RequestStatus.ACCEPTED
                        && newStatus == RequestStatus.DISPATCHED)

                        || (currentStatus == RequestStatus.DISPATCHED
                        && newStatus == RequestStatus.DELIVERED);

        if (!validTransition) {

            throw new InvalidStatusTransitionException(
                    "Cannot change status from "
                            + currentStatus
                            + " to "
                            + newStatus);
        }

        helpRequest.setStatus(newStatus);

        HelpRequest updatedRequest =
                helpRequestRepository.save(helpRequest);

        return toResponse(updatedRequest);
    }

    // Convert Entity → Response DTO
    private HelpRequestResponse toResponse(
            HelpRequest request) {

        return new HelpRequestResponse(
                request.getId(),
                request.getName(),
                request.getLocation(),
                request.getPeopleCount(),
                request.getHelpType(),
                request.getPriority(),
                request.getDescription(),
                request.getStatus()
        );
    }
}