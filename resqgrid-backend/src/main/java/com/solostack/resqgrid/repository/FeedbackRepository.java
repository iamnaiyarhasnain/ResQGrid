package com.solostack.resqgrid.repository;

import com.solostack.resqgrid.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}
