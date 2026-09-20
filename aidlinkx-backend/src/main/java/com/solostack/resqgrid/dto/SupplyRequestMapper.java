package com.solostack.resqgrid.dto;

import com.solostack.resqgrid.entity.SupplyRequest;

// Utility class responsible for converting
// SupplyRequest Entity → SupplyRequestResponse DTO
public class SupplyRequestMapper {

    // Private constructor prevents creating objects
    // of this utility class.
    private SupplyRequestMapper() {
    }


    // Converts Entity into Response DTO
    public static SupplyRequestResponse toResponse(
            SupplyRequest supplyRequest) {

        return new SupplyRequestResponse(

                // Entity ID
                supplyRequest.getId(),

                // Camp information
                supplyRequest.getCampId(),

                // Number of affected people
                supplyRequest.getPeopleAffected(),

                // Required supplies
                supplyRequest.getWaterQuantity(),
                supplyRequest.getFoodQuantity(),
                supplyRequest.getMedicineQuantity(),
                supplyRequest.getBlanketQuantity(),

                // Priority and current status
                supplyRequest.getPriority(),
                supplyRequest.getStatus()
        );
    }
}