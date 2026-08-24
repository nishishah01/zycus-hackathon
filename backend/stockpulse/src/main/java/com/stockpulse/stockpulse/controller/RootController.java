package com.stockpulse.stockpulse.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
                "application", "StockPulse",
                "status", "running",
                "endpoints", Map.of(
                        "products", "/products",
                        "pricingSuggestions", "/pricing-suggestions",
                        "reorderSuggestions", "/reorder-suggestions"
                )
        );
    }
}