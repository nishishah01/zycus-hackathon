package com.stockpulse.stockpulse.strategy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockpulse.stockpulse.ai.LLMGateway;
import com.stockpulse.stockpulse.domain.Product;
import com.stockpulse.stockpulse.domain.PricingSuggestion;
import com.stockpulse.stockpulse.domain.ReorderSuggestion;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component("AI")
public class AICommerceStrategy implements CommerceStrategy {

    private final LLMGateway llmGateway;
    private final RuleBasedCommerceStrategy fallback;
    private final ObjectMapper mapper = new ObjectMapper();

    public AICommerceStrategy(
            LLMGateway llmGateway,
            @Qualifier("RULE") RuleBasedCommerceStrategy fallback) {

        this.llmGateway = llmGateway;
        this.fallback = fallback;
    }

    @Override
    public CommerceStrategy.PricingRecommendation recommendPrice(
            Product product,
            PricingSuggestion.TriggerReason triggerReason) {

        try {

            String prompt = """
                    You are an AI merchandising advisor.

                    Product:
                    Name: %s
                    Category: %s
                    Current price: %.2f
                    Stock: %d
                    Reorder threshold: %d
                    Demand velocity: %d

                    Trigger: %s

                    Recommend a price adjustment.

                    IMPORTANT:
                    Return ONLY valid JSON.
                    No markdown.
                    No explanation outside JSON.

                    Format:
                    {
                      "recommendedPrice": 0.0,
                      "direction": "INCREASE",
                      "confidence": 0.0,
                      "reasoning": "short explanation"
                    }

                    Rules:
                    - price must be positive
                    - confidence must be between 0 and 1
                    - direction must be INCREASE, DECREASE or HOLD
                    - avoid extreme price changes
                    """.formatted(
                    product.getName(),
                    product.getCategory(),
                    product.getCurrentPrice(),
                    product.getStockLevel(),
                    product.getReorderThreshold(),
                    product.getDemandVelocity(),
                    triggerReason
            );

            String response = llmGateway.callLLM(prompt);

            JsonNode json = mapper.readTree(cleanJson(response));

            double price = json.get("recommendedPrice").asDouble();
            String direction = json.get("direction").asText();
            double confidence = json.get("confidence").asDouble();
            String reasoning = json.get("reasoning").asText();

            // Safety validation
            if (price <= 0) {
                throw new RuntimeException("Invalid AI price");
            }

            if (price > product.getCurrentPrice() * 2
                    || price < product.getCurrentPrice() * 0.5) {

                throw new RuntimeException("AI price outside safe bounds");
            }

            if (confidence < 0 || confidence > 1) {
                throw new RuntimeException("Invalid confidence");
            }

            return new CommerceStrategy.PricingRecommendation(
                    price,
                    PricingSuggestion.Direction.valueOf(direction),
                    confidence,
                    reasoning
            );

        } catch (Exception e) {

            return fallback.recommendPrice(
                    product,
                    triggerReason
            );
        }
    }

    @Override
    public CommerceStrategy.ReorderRecommendation recommendReorder(
            Product product,
            ReorderSuggestion.TriggerReason triggerReason) {

        try {

            String prompt = """
                    You are an AI inventory replenishment advisor.

                    Product:
                    Name: %s
                    Category: %s
                    Stock: %d
                    Reorder threshold: %d
                    Demand velocity: %d

                    Trigger: %s

                    Recommend a reorder quantity.

                    Return ONLY valid JSON.

                    {
                      "recommendedQuantity": 0,
                      "confidence": 0.0,
                      "reasoning": "short explanation"
                    }

                    Rules:
                    - quantity must be a positive integer
                    - confidence must be between 0 and 1
                    """.formatted(
                    product.getName(),
                    product.getCategory(),
                    product.getStockLevel(),
                    product.getReorderThreshold(),
                    product.getDemandVelocity(),
                    triggerReason
            );

            String response = llmGateway.callLLM(prompt);

            JsonNode json = mapper.readTree(cleanJson(response));

            int quantity = json.get("recommendedQuantity").asInt();
            double confidence = json.get("confidence").asDouble();
            String reasoning = json.get("reasoning").asText();

            if (quantity <= 0) {
                throw new RuntimeException("Invalid reorder quantity");
            }

            if (confidence < 0 || confidence > 1) {
                throw new RuntimeException("Invalid confidence");
            }

            return new CommerceStrategy.ReorderRecommendation(
                    quantity,
                    5,
                    confidence,
                    reasoning
            );

        } catch (Exception e) {

            return fallback.recommendReorder(
                    product,
                    triggerReason
            );
        }
    }

    private String cleanJson(String response) {

        response = response.trim();

        if (response.startsWith("```")) {
            response = response
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();
        }

        return response;
    }
}