package com.stockpulse.stockpulse.repository;

import com.stockpulse.stockpulse.domain.PricingSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PricingSuggestionRepository
        extends JpaRepository<PricingSuggestion, String> {

    List<PricingSuggestion> findByStatus(
            PricingSuggestion.SuggestionStatus status
    );

    boolean existsByProductIdAndTriggerReasonAndStatus(
            String productId,
            PricingSuggestion.TriggerReason triggerReason,
            PricingSuggestion.SuggestionStatus status
    );
}