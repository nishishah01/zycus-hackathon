package com.stockpulse.stockpulse.service;

import com.stockpulse.stockpulse.domain.Product;
import com.stockpulse.stockpulse.event.InventoryEvent;
import com.stockpulse.stockpulse.repository.ProductRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommerceService {

    private final ProductRepository productRepository;
    private final ApplicationEventPublisher eventPublisher;

    public CommerceService(
            ProductRepository productRepository,
            ApplicationEventPublisher eventPublisher) {

        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Product createProduct(Product product) {

        product.updateStatus();

        return productRepository.save(product);
    }

    @Transactional
    public Product simulateOrder(
            String productId,
            int quantity) {

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                ));

        product.decreaseStock(quantity);

        Product saved =
                productRepository.save(product);

        // Event fires after stock changed
        eventPublisher.publishEvent(
                new InventoryEvent(
                        this,
                        product.getId(),
                        product.getStockLevel(),
                        product.getDemandVelocity()
                )
        );

        return saved;
    }

    @Transactional
    public Product updateStock(
            String productId,
            int stockLevel) {

        Product product =
                productRepository.findById(productId)
                        .orElseThrow();

        product.setStockLevel(stockLevel);

        Product saved =
                productRepository.save(product);

        eventPublisher.publishEvent(
                new InventoryEvent(
                        this,
                        product.getId(),
                        product.getStockLevel(),
                        product.getDemandVelocity()
                )
        );

        return saved;
    }
}