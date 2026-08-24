package com.stockpulse.stockpulse.strategy;

import com.stockpulse.stockpulse.domain.Product;
import com.stockpulse.stockpulse.domain.PricingSuggestion;
import com.stockpulse.stockpulse.domain.ReorderSuggestion;

public interface CommerceStrategy {

    PricingRecommendation recommendPrice(
            Product product,
            PricingSuggestion.TriggerReason triggerReason
    );

    ReorderRecommendation recommendReorder(
            Product product,
            ReorderSuggestion.TriggerReason triggerReason
    );

    record PricingRecommendation(
            double recommendedPrice,
            PricingSuggestion.Direction direction,
            double confidence,
            String reasoning
    ) {}

    record ReorderRecommendation(
            int recommendedQuantity,
            int leadTimeDays,
            double confidence,
            String reasoning
    ) {}
}