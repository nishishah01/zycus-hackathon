package com.stockpulse.stockpulse.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class LLMGateway {

    @Value("${llm.base-url}")
    private String baseUrl;

    @Value("${llm.api-key}")
    private String apiKey;

    @Value("${llm.model}")
    private String model;

    private final RestClient client;

    public LLMGateway() {
        this.client = RestClient.builder().build();
    }

    public String callLLM(String prompt) {

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                )
        );

        Map response = client.post()
                .uri(baseUrl + "/v1/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("product", "PC1")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new RuntimeException("Empty LLM response");
        }

        List choices = (List) response.get("choices");

        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("No choices returned from LLM");
        }

        Map choice = (Map) choices.get(0);
        Map message = (Map) choice.get("message");

        return String.valueOf(message.get("content"));
    }
}