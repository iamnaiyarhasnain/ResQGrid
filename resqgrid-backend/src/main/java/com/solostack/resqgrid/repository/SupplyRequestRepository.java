package com.solostack.resqgrid.repository;

import com.solostack.resqgrid.entity.Priority;
import com.solostack.resqgrid.entity.RequestStatus;
import com.solostack.resqgrid.entity.SupplyRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Repository is responsible for communicating with the database.
//
// JpaRepository already provides common database operations such as:
// save()
// findAll()
// findById()
// deleteById()
// existsById()
//
// SupplyRequest = Entity we are working with
// Long = Data type of the entity's primary key
public interface SupplyRequestRepository
        extends JpaRepository<SupplyRequest, Long> {

    // We don't need to write any methods yet.
    // JpaRepository already provides the basic CRUD operations.



 // Finds all supply requests having the given priority.
// Spring Data JPA automatically creates the database query
// based on the method name.
    List<SupplyRequest> findByPriority(Priority priority);



// Finds requests matching BOTH priority and status.
// Example:
// priority = CRITICAL
// status = PENDING
// Spring Data JPA automatically creates the query
// from the method name.
    List<SupplyRequest> findByPriorityAndStatus(
            Priority priority,
            RequestStatus status);
}