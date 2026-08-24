package com.stockpulse.stockpulse.event;

import org.springframework.context.ApplicationEvent;

public class InventoryEvent extends ApplicationEvent {

    private final String productId;
    private final int stockLevel;
    private final int demandVelocity;

    public InventoryEvent(
            Object source,
            String productId,
            int stockLevel,
            int demandVelocity) {

        super(source);

        this.productId = productId;
        this.stockLevel = stockLevel;
        this.demandVelocity = demandVelocity;
    }

    public String getProductId() {
        return productId;
    }

    public int getStockLevel() {
        return stockLevel;
    }

    public int getDemandVelocity() {
        return demandVelocity;
    }
}