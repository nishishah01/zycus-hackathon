package com.stockpulse.stockpulse.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stockpulse.stockpulse.domain.Product;
import com.stockpulse.stockpulse.repository.ProductRepository;
import com.stockpulse.stockpulse.service.CommerceService;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:4200"
})
public class ProductController {

    private final ProductRepository productRepository;
    private final CommerceService commerceService;

    public ProductController(
            ProductRepository productRepository,
            CommerceService commerceService) {

        this.productRepository = productRepository;
        this.commerceService = commerceService;
    }

    @PostMapping
    public Product create(
            @RequestBody Product product) {

        return commerceService.createProduct(product);
    }

    @GetMapping
    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProduct(
            @PathVariable String id) {

        return productRepository.findById(id)
                .orElseThrow();
    }

    @PatchMapping("/{id}/stock")
    public Product updateStock(
            @PathVariable String id,
            @RequestParam int stockLevel) {

        return commerceService.updateStock(
                id,
                stockLevel
        );
    }

    @PostMapping("/{id}/orders")
    public Product order(
            @PathVariable String id,
            @RequestParam(defaultValue = "1") int quantity) {

        return commerceService.simulateOrder(
                id,
                quantity
        );
    }
}