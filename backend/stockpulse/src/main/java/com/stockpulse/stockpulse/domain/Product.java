package com.stockpulse.stockpulse.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String sku;

    private String name;

    @Enumerated(EnumType.STRING)
    private Category category;

    private double currentPrice;

    private int stockLevel;

    private int reorderThreshold;

    private int demandVelocity;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    // Sprint 2 extension points
    private Double costPrice;
    private String supplierId;

    public enum Category {
        ELECTRONICS,
        APPAREL,
        HOME
    }

    public enum ProductStatus {
        ACTIVE,
        PRICE_REVIEW_PENDING,
        OUT_OF_STOCK
    }

    public Product() {
    }

    public Product(String sku, String name, Category category,
                   double currentPrice, int stockLevel,
                   int reorderThreshold, int demandVelocity) {

        this.sku = sku;
        this.name = name;
        this.category = category;
        this.currentPrice = currentPrice;
        this.stockLevel = stockLevel;
        this.reorderThreshold = reorderThreshold;
        this.demandVelocity = demandVelocity;

        updateStatus();
    }

    public void updateStatus() {
        if (stockLevel <= 0) {
            status = ProductStatus.OUT_OF_STOCK;
        } else if (stockLevel < reorderThreshold) {
            status = ProductStatus.PRICE_REVIEW_PENDING;
        } else {
            status = ProductStatus.ACTIVE;
        }
    }

    public void decreaseStock(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        if (quantity > stockLevel) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        stockLevel -= quantity;
        demandVelocity += quantity;

        updateStatus();
    }

    public void increaseStock(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        stockLevel += quantity;
        updateStatus();
    }

    // Getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public int getStockLevel() {
        return stockLevel;
    }

    public void setStockLevel(int stockLevel) {
        this.stockLevel = stockLevel;
        updateStatus();
    }

    public int getReorderThreshold() {
        return reorderThreshold;
    }

    public void setReorderThreshold(int reorderThreshold) {
        this.reorderThreshold = reorderThreshold;
        updateStatus();
    }

    public int getDemandVelocity() {
        return demandVelocity;
    }

    public void setDemandVelocity(int demandVelocity) {
        this.demandVelocity = demandVelocity;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public Double getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(Double costPrice) {
        this.costPrice = costPrice;
    }

    public String getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(String supplierId) {
        this.supplierId = supplierId;
    }
}