package com.solostack.resqgrid.repository;

import com.solostack.resqgrid.entity.HelpRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HelpRequestRepository
        extends JpaRepository<HelpRequest, Long> {

    Optional<HelpRequest> findByClientRequestId(String clientRequestId);
}
