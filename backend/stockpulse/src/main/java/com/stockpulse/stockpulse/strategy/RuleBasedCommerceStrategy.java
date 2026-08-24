package com.stockpulse.stockpulse.strategy;

import com.stockpulse.stockpulse.domain.Product;
import com.stockpulse.stockpulse.domain.PricingSuggestion;
import com.stockpulse.stockpulse.domain.ReorderSuggestion;
import org.springframework.stereotype.Component;

@Component("RULE")
public class RuleBasedCommerceStrategy implements CommerceStrategy {

    @Override
    public PricingRecommendation recommendPrice(
            Product product,
            PricingSuggestion.TriggerReason triggerReason) {

        double price = product.getCurrentPrice();

        if (product.getStockLevel() < product.getReorderThreshold()) {

            double newPrice = price * 1.10;

            return new PricingRecommendation(
                    newPrice,
                    PricingSuggestion.Direction.INCREASE,
                    0.90,
                    "Inventory is below the reorder threshold. "
                            + "A 10% price increase protects remaining inventory."
            );
        }

        if (product.getDemandVelocity() > 10) {

            double newPrice = price * 1.05;

            return new PricingRecommendation(
                    newPrice,
                    PricingSuggestion.Direction.INCREASE,
                    0.82,
                    "Demand velocity is elevated. "
                            + "A modest 5% increase captures demand while avoiding aggressive pricing."
            );
        }

        return new PricingRecommendation(
                price,
                PricingSuggestion.Direction.HOLD,
                0.75,
                "Inventory and demand are currently within normal operating ranges."
        );
    }

    @Override
    public ReorderRecommendation recommendReorder(
            Product product,
            ReorderSuggestion.TriggerReason triggerReason) {

        int quantity =
                Math.max(
                        1,
                        product.getReorderThreshold() * 3
                                - product.getStockLevel()
                );

        return new ReorderRecommendation(
                quantity,
                5,
                0.85,
                "Recommended quantity restores approximately three reorder-threshold "
                        + "cycles of inventory."
        );
    }
}