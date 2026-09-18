package com.solostack.resqgrid.repository;

import com.solostack.resqgrid.entity.HelpRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HelpRequestRepository
        extends JpaRepository<HelpRequest, Long> {
}