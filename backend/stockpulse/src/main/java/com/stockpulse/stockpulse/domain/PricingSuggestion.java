package com.stockpulse.stockpulse.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "pricing_suggestions")
public class PricingSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    private Product product;

    private double currentPrice;
    private double recommendedPrice;

    @Enumerated(EnumType.STRING)
    private Direction direction;

    private double confidence;

    @Column(length = 2000)
    private String reasoning;

    @Enumerated(EnumType.STRING)
    private SuggestionStatus status;

    @Enumerated(EnumType.STRING)
    private TriggerReason triggerReason;

    public enum Direction {
        INCREASE,
        DECREASE,
        HOLD
    }

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

    public PricingSuggestion() {
    }

    // Getters and setters

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

    public double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public double getRecommendedPrice() {
        return recommendedPrice;
    }

    public void setRecommendedPrice(double recommendedPrice) {
        this.recommendedPrice = recommendedPrice;
    }

    public Direction getDirection() {
        return direction;
    }

    public void setDirection(Direction direction) {
        this.direction = direction;
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