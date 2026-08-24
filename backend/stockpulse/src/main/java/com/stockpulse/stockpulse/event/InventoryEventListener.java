package com.stockpulse.stockpulse.event;

import com.stockpulse.stockpulse.domain.Product;
import com.stockpulse.stockpulse.service.RecommendationService;
import com.stockpulse.stockpulse.repository.ProductRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;

@Component
public class InventoryEventListener {

    private final ProductRepository productRepository;
    private final RecommendationService recommendationService;

    public InventoryEventListener(
            ProductRepository productRepository,
            RecommendationService recommendationService) {

        this.productRepository = productRepository;
        this.recommendationService = recommendationService;
    }

    @Async
    @EventListener
    public void handleInventoryEvent(InventoryEvent event) {

        Product product =
                productRepository.findById(event.getProductId())
                        .orElse(null);

        if (product == null) {
            return;
        }

        if (event.getStockLevel()
                < product.getReorderThreshold()) {

            recommendationService.generateSuggestions(
                    product.getId(),
                    com.stockpulse.stockpulse.domain.PricingSuggestion.TriggerReason
                            .INVENTORY_LOW
            );
        }

        // Simple demo threshold.
        // Later replace with category average.
        if (event.getDemandVelocity() >= 10) {

            recommendationService.generateSuggestions(
                    product.getId(),
                    com.stockpulse.stockpulse.domain.PricingSuggestion.TriggerReason
                            .DEMAND_SPIKE
            );
        }
    }
}