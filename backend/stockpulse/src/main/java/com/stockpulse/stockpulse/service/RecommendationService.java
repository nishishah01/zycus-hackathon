package com.stockpulse.stockpulse.service;

import com.stockpulse.stockpulse.domain.PricingSuggestion;
import com.stockpulse.stockpulse.domain.Product;
import com.stockpulse.stockpulse.domain.ReorderSuggestion;
import com.stockpulse.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.stockpulse.repository.ReorderSuggestionRepository;
import com.stockpulse.stockpulse.repository.ProductRepository;
import com.stockpulse.stockpulse.strategy.CommerceStrategy;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RecommendationService {

    private final ProductRepository productRepository;
    private final PricingSuggestionRepository pricingRepository;
    private final ReorderSuggestionRepository reorderRepository;

    private final CommerceStrategy ruleStrategy;
    private final CommerceStrategy aiStrategy;

    @Value("${commerce.strategy:AI}")
    private String activeStrategy;

    public RecommendationService(
            ProductRepository productRepository,
            PricingSuggestionRepository pricingRepository,
            ReorderSuggestionRepository reorderRepository,
            @Qualifier("RULE") CommerceStrategy ruleStrategy,
            @Qualifier("AI") CommerceStrategy aiStrategy) {

        this.productRepository = productRepository;
        this.pricingRepository = pricingRepository;
        this.reorderRepository = reorderRepository;
        this.ruleStrategy = ruleStrategy;
        this.aiStrategy = aiStrategy;
    }

    private CommerceStrategy strategy() {

        return "RULE".equalsIgnoreCase(activeStrategy)
                ? ruleStrategy
                : aiStrategy;
    }

    public void generateSuggestions(
            String productId,
            PricingSuggestion.TriggerReason triggerReason) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        // Prevent duplicate pending pricing suggestions
        boolean pricingExists =
                pricingRepository
                        .existsByProductIdAndTriggerReasonAndStatus(
                                productId,
                                triggerReason,
                                PricingSuggestion.SuggestionStatus.PENDING
                        );

        if (!pricingExists) {

            CommerceStrategy.PricingRecommendation recommendation =
                    strategy().recommendPrice(product, triggerReason);

            PricingSuggestion suggestion =
                    new PricingSuggestion();

            suggestion.setProduct(product);
            suggestion.setCurrentPrice(product.getCurrentPrice());
            suggestion.setRecommendedPrice(
                    recommendation.recommendedPrice()
            );
            suggestion.setDirection(
                    recommendation.direction()
            );
            suggestion.setConfidence(
                    recommendation.confidence()
            );
            suggestion.setReasoning(
                    recommendation.reasoning()
            );
            suggestion.setStatus(
                    PricingSuggestion.SuggestionStatus.PENDING
            );
            suggestion.setTriggerReason(triggerReason);

            pricingRepository.save(suggestion);
        }

        // Reorder
        boolean reorderExists =
                reorderRepository
                        .existsByProductIdAndTriggerReasonAndStatus(
                                productId,
                                ReorderSuggestion.TriggerReason.valueOf(
                                        triggerReason.name()
                                ),
                                ReorderSuggestion.SuggestionStatus.PENDING
                        );

        if (!reorderExists) {

            CommerceStrategy.ReorderRecommendation recommendation =
                    strategy().recommendReorder(
                            product,
                            ReorderSuggestion.TriggerReason.valueOf(
                                    triggerReason.name()
                            )
                    );

            ReorderSuggestion suggestion =
                    new ReorderSuggestion();

            suggestion.setProduct(product);
            suggestion.setCurrentStock(product.getStockLevel());
            suggestion.setRecommendedQuantity(
                    recommendation.recommendedQuantity()
            );
            suggestion.setSuggestedLeadTimeDays(
                    recommendation.leadTimeDays()
            );
            suggestion.setConfidence(
                    recommendation.confidence()
            );
            suggestion.setReasoning(
                    recommendation.reasoning()
            );
            suggestion.setStatus(
                    ReorderSuggestion.SuggestionStatus.PENDING
            );
            suggestion.setTriggerReason(
                    ReorderSuggestion.TriggerReason.valueOf(
                            triggerReason.name()
                    )
            );

            reorderRepository.save(suggestion);
        }
    }

    public PricingSuggestion acceptPricing(String id) {

        PricingSuggestion suggestion =
                pricingRepository.findById(id)
                        .orElseThrow();

        if (suggestion.getStatus()
                != PricingSuggestion.SuggestionStatus.PENDING) {

            throw new RuntimeException(
                    "Suggestion already processed"
            );
        }

        Product product = suggestion.getProduct();

        product.setCurrentPrice(
                suggestion.getRecommendedPrice()
        );

        suggestion.setStatus(
                PricingSuggestion.SuggestionStatus.ACCEPTED
        );

        productRepository.save(product);

        return pricingRepository.save(suggestion);
    }

    public PricingSuggestion rejectPricing(String id) {

        PricingSuggestion suggestion =
                pricingRepository.findById(id)
                        .orElseThrow();

        suggestion.setStatus(
                PricingSuggestion.SuggestionStatus.REJECTED
        );

        return pricingRepository.save(suggestion);
    }

    public ReorderSuggestion acceptReorder(String id) {

        ReorderSuggestion suggestion =
                reorderRepository.findById(id)
                        .orElseThrow();

        Product product = suggestion.getProduct();

        product.increaseStock(
                suggestion.getRecommendedQuantity()
        );

        suggestion.setStatus(
                ReorderSuggestion.SuggestionStatus.ACCEPTED
        );

        productRepository.save(product);

        return reorderRepository.save(suggestion);
    }

    public ReorderSuggestion rejectReorder(String id) {

        ReorderSuggestion suggestion =
                reorderRepository.findById(id)
                        .orElseThrow();

        suggestion.setStatus(
                ReorderSuggestion.SuggestionStatus.REJECTED
        );

        return reorderRepository.save(suggestion);
    }
}