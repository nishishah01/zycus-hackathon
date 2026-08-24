package com.stockpulse.stockpulse.repository;

import com.stockpulse.stockpulse.domain.ReorderSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReorderSuggestionRepository
        extends JpaRepository<ReorderSuggestion, String> {

    List<ReorderSuggestion> findByStatus(
            ReorderSuggestion.SuggestionStatus status
    );

    boolean existsByProductIdAndTriggerReasonAndStatus(
            String productId,
            ReorderSuggestion.TriggerReason triggerReason,
            ReorderSuggestion.SuggestionStatus status
    );
}