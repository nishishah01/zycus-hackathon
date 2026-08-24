package com.stockpulse.stockpulse.controller;

import com.stockpulse.stockpulse.domain.PricingSuggestion;
import com.stockpulse.stockpulse.domain.ReorderSuggestion;
import com.stockpulse.stockpulse.repository.PricingSuggestionRepository;
import com.stockpulse.stockpulse.repository.ReorderSuggestionRepository;
import com.stockpulse.stockpulse.service.RecommendationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:4200"
})
public class SuggestionController {

    private final RecommendationService recommendationService;
    private final PricingSuggestionRepository pricingRepository;
    private final ReorderSuggestionRepository reorderRepository;

    public SuggestionController(
            RecommendationService recommendationService,
            PricingSuggestionRepository pricingRepository,
            ReorderSuggestionRepository reorderRepository) {

        this.recommendationService = recommendationService;
        this.pricingRepository = pricingRepository;
        this.reorderRepository = reorderRepository;
    }

    @PostMapping("/products/{id}/suggest-pricing")
    public void suggestPricing(
            @PathVariable String id) {

        recommendationService.generateSuggestions(
                id,
                PricingSuggestion.TriggerReason.MANUAL
        );
    }

    @PostMapping("/products/{id}/suggest-reorder")
    public void suggestReorder(
            @PathVariable String id) {

        recommendationService.generateSuggestions(
                id,
                PricingSuggestion.TriggerReason.MANUAL
        );
    }

    @GetMapping("/pricing-suggestions")
    public List<PricingSuggestion> pricingSuggestions() {
        return pricingRepository.findAll();
    }

    @GetMapping("/reorder-suggestions")
    public List<ReorderSuggestion> reorderSuggestions() {
        return reorderRepository.findAll();
    }

    @PatchMapping("/pricing-suggestions/{id}")
    public PricingSuggestion updatePricing(
            @PathVariable String id,
            @RequestParam boolean accept) {

        if (accept) {
            return recommendationService.acceptPricing(id);
        }

        return recommendationService.rejectPricing(id);
    }

    @PatchMapping("/reorder-suggestions/{id}")
    public ReorderSuggestion updateReorder(
            @PathVariable String id,
            @RequestParam boolean accept) {

        if (accept) {
            return recommendationService.acceptReorder(id);
        }

        return recommendationService.rejectReorder(id);
    }
}