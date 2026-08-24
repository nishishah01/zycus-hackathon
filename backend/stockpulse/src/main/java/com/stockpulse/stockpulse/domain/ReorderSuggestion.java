package com.stockpulse.stockpulse.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "reorder_suggestions")
public class ReorderSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    private Product product;

    private int currentStock;

    private int recommendedQuantity;

    private int suggestedLeadTimeDays;

    private double confidence;

    @Column(length = 2000)
    private String reasoning;

    @Enumerated(EnumType.STRING)
    private SuggestionStatus status;

    @Enumerated(EnumType.STRING)
    private TriggerReason triggerReason;

    public enum SuggestionStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    public enum TriggerReason {
        INITIAL,
        INVENTORY_LOW,
        DEMAND_SPIKE,
        MANUAL
    }

    public ReorderSuggestion() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(int currentStock) {
        this.currentStock = currentStock;
    }

    public int getRecommendedQuantity() {
        return recommendedQuantity;
    }

    public void setRecommendedQuantity(int recommendedQuantity) {
        this.recommendedQuantity = recommendedQuantity;
    }

    public int getSuggestedLeadTimeDays() {
        return suggestedLeadTimeDays;
    }

    public void setSuggestedLeadTimeDays(int suggestedLeadTimeDays) {
        this.suggestedLeadTimeDays = suggestedLeadTimeDays;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public SuggestionStatus getStatus() {
        return status;
    }

    public void setStatus(SuggestionStatus status) {
        this.status = status;
    }

    public TriggerReason getTriggerReason() {
        return triggerReason;
    }

    public void setTriggerReason(TriggerReason triggerReason) {
        this.triggerReason = triggerReason;
    }
}