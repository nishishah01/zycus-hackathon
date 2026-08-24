# Architecture Decision Records — StockPulse

## ADR-1: Commerce Logic Lives in Service Layer with Strategy Pattern Delegation

**Context**  
Pricing and reorder recommendations require both domain logic and persistence. Services accumulate pricing decisions, reorder calculations, event publishing, and repository interactions. Without a clear boundary, CommerceService and RecommendationService could become god objects mixing transaction management, business rules, and data access.

**Options**  
1. Place all logic in domain model (`Product` class methods)  
2. Keep orchestration in services, delegate decision-making to strategies  
3. Create a dedicated `CommerceAdvisor` component separate from services  

**Decision**  
Service layer (CommerceService, RecommendationService) orchestrates; **Strategy pattern** (CommerceStrategy interface) delegates decision-making. Services remain thin orchestrators handling transactions and events; strategies encapsulate pricing/reorder algorithms.  
- `RecommendationService`: owns suggestion persistence, deduplication, trigger logic  
- `CommerceStrategy`: owns price/reorder *calculation*  
- `CommerceService`: owns product mutations and event publishing

**Tradeoffs**  
- ✓ Clear separation of concerns; strategies are testable in isolation  
- ✓ Easy to add a third strategy without touching services  
- ✗ Adds another layer; simple single-rule services could skip it  
- ✗ Strategies don't own persistence (services do) — slight coupling on schema

---

## ADR-2: Separate Strategy Methods for Pricing vs. Reorder (Not Unified AI Call)

**Context**  
A single LLM call returning `{price, reorderQty}` is cheaper and faster than two calls. However, pricing may trigger more frequently than reorder, and either could fail independently. Separate calls allow independent fallback paths and clearer contracts.

**Options**  
1. One unified LLM call: `"Give me price AND reorder qty"` → parse single JSON  
2. Two separate calls: `recommendPrice()` and `recommendReorder()` independently  
3. Hybrid: batch calls in production, separate in dev/testing  

**Decision**  
Two separate method contracts on `CommerceStrategy`:
```java
PricingRecommendation recommendPrice(Product, TriggerReason)
ReorderRecommendation recommendReorder(Product, TriggerReason)
```
Each can be called independently. Pricing is driven by stock level or demand; reorder is driven by crossing threshold. They have different confidence intervals and reasoning.

**Tradeoffs**  
- ✓ Failures are independent; if LLM times out on reorder, pricing still completes  
- ✓ Rule-based fallback is simpler per strategy (price rules ≠ reorder rules)  
- ✓ Sprint 2 can tune pricing call frequency without affecting reorder  
- ✗ Two LLM calls cost 2× API tokens; mitigated by async processing and caching  
- ✗ Slightly more code; unified call would be more concise  

---

## ADR-3: Runtime Strategy Switching via Spring Qualifiers and Property-Based Selection

**Context**  
Two strategies exist: `AICommerceStrategy` (LLM-based) and `RuleBasedCommerceStrategy` (deterministic). We need to toggle between them at runtime without redeployment, supporting A/B testing and quick fallback.

**Options**  
1. Bean map + factory: `@Bean Map<String, CommerceStrategy> strategies()`  
2. Spring `@Qualifier` + `@Value` property: inject both beans, select at runtime  
3. Strategy registry with startup scanning  

**Decision**  
Use Spring `@Qualifier("AI")` and `@Qualifier("RULE")` to inject both beans into RecommendationService. Select active strategy via property:
```java
@Value("${commerce.strategy:AI}")
private String activeStrategy;

private CommerceStrategy strategy() {
    return "RULE".equalsIgnoreCase(activeStrategy) ? ruleStrategy : aiStrategy;
}
```
This works from both HTTP endpoints (sync) and async event listeners.

**Tradeoffs**  
- ✓ Externalized via `application.properties`; no code change to toggle  
- ✓ Both strategies always initialized (fast fallback if one fails)  
- ✓ Simple single property; no factory registration needed  
- ✗ Both beans loaded at startup even if one unused (memory overhead ~negligible)  
- ✗ No A/B testing by user/product yet (sprint 2 can add router layer)  

---

## ADR-4: LLM Failures Handled via Exception → Fallback to Rule-Based Strategy

**Context**  
LLMs fail: timeouts, malformed JSON, absurd prices ($0, $999,999), rate limits. Pricing/reorder must still happen. Async paths cannot block waiting for retries.

**Options**  
1. Retry with exponential backoff + circuit breaker  
2. Catch exception, log, fall back to rule-based immediately  
3. Queue failed request for later replay; return null suggestion  

**Decision**  
AICommerceStrategy catches all exceptions and falls back to rule-based:
```java
try {
    String response = llmGateway.callLLM(prompt);
    JsonNode json = mapper.readTree(cleanJson(response));
    double price = json.get("recommendedPrice").asDouble();
    
    // Safety validation
    if (price <= 0) throw new RuntimeException("Invalid AI price");
    if (price > currentPrice * 2 || price < currentPrice * 0.5) 
        throw new RuntimeException("Price out of bounds");
        
    return new PricingRecommendation(...);
} catch (Exception e) {
    // Fall back to rule-based
    return fallback.recommendPrice(product, triggerReason);
}
```
Validation catches nonsensical prices before they corrupt suggestions.

**Tradeoffs**  
- ✓ System always produces a suggestion (rule-based as safety net)  
- ✓ Async paths don't block on LLM timeouts  
- ✓ Invalid JSON or absurd values trigger fallback immediately  
- ✗ Silent fallback hides LLM failures; need observability/logging  
- ✗ No retry logic; urgent spike might miss AI insight (sprint 2 can add queueing)  

---

## ADR-5: Async Event-Driven Loop Decouples Stock/Order Events from Recommendation Generation

**Context**  
Updating stock and publishing InventoryEvent must not block the HTTP response. Recommendation generation (LLM calls, suggestion persistence) is slow and should run in background. Events must be idempotent to avoid duplicate suggestions.

**Options**  
1. Synchronous: call `RecommendationService` immediately; slow response times  
2. Fire-and-forget event + `@Async` listener (current design)  
3. Queue to message broker (RabbitMQ/Kafka); overkill for current scale  

**Decision**  
Spring event-driven architecture:
- `CommerceService.simulateOrder()` publishes `InventoryEvent` after stock update  
- `InventoryEventListener` listens with `@Async` and `@EventListener`  
- Listener calls `RecommendationService.generateSuggestions()` in background thread
- Idempotency via deduplication: `existsByProductIdAndTriggerReasonAndStatus(PENDING)` prevents duplicate suggestions for same trigger

```java
@Async
@EventListener
public void handleInventoryEvent(InventoryEvent event) {
    if (product.getStockLevel() < threshold) {
        recommendationService.generateSuggestions(productId, INVENTORY_LOW);
    }
}
```

**Tradeoffs**  
- ✓ Fast response: stock update returns before LLM call  
- ✓ Decoupled: event listener can be swapped or disabled for testing  
- ✓ Idempotency prevents duplicate PENDING suggestions  
- ✓ Spring async pool scales with demand  
- ✗ No persistence guarantee (event lost if process crashes mid-emit)  
- ✗ No visibility into background job status from HTTP response  
- ✗ Eventual consistency: UI may see stale stock before suggestion appears  

---

## ADR-6: Strategy Pattern + Qualifier Beans = Extensibility Seam for Sprint 2

**Context**  
Sprint 1 needs AI + rule-based strategies. Sprint 2 may add a hybrid model, customer-specific strategy, or predictive algorithm. Code must not require changes to RecommendationService or CommerceService to onboard a third strategy.

**Options**  
1. Hardcode AI/RULE in service; add third strategy later (tight coupling)  
2. Parameterized strategy selection from property file  
3. Strategy registry with annotation-based auto-discovery  

**Decision**  
Use Spring `@Component` + `@Qualifier` for each strategy:
```java
@Component("AI")
public class AICommerceStrategy implements CommerceStrategy { ... }

@Component("RULE")
public class RuleBasedCommerceStrategy implements CommerceStrategy { ... }
```
To add Sprint 2 strategy (e.g., `HybridCommerceStrategy`):
1. Create new class `HybridCommerceStrategy implements CommerceStrategy`  
2. Annotate `@Component("HYBRID")`  
3. Update RecommendationService constructor to inject it  
4. Add property option to `application.properties`

No changes to service orchestration logic.

**Extensibility Points**  
- **New strategy**: Add `@Component` + implement interface  
- **Per-product strategy**: Sprint 2 can add router layer that selects strategy per product  
- **A/B testing**: Spring profiles can isolate strategies by environment  
- **Performance tuning**: LLM call frequency can be decoupled from reorder frequency later  

**Deferred (Sprint 2+)**  
- Lazy strategy initialization (only create beans on demand)  
- Per-product or per-category strategy routing  
- Caching layer for repeated calls  
- Monitoring/tracing for strategy selection and fallback rate  
- Message queue for failed LLM calls (replay logic)  

**Tradeoffs**  
- ✓ New strategy needs no changes to existing code  
- ✓ Clear extension point: CommerceStrategy interface  
- ✗ All strategies loaded on startup (use Spring `@ConditionalOnProperty` later)  
- ✗ No built-in strategy registry (factory class exists but not automated)  

---

## Summary Table

| Decision | Approach | Rationale |
|----------|----------|-----------|
| Commerce logic boundary | Service orchestration + Strategy delegation | Clear separation; testable; extensible |
| AI vs rule | Separate method calls (recommendPrice, recommendReorder) | Independent fallback; clearer contracts |
| Strategy selection | Spring Qualifier + property-based dispatch | Runtime toggle; works sync + async |
| LLM failure | Exception → immediate fallback to rule-based | Always produce suggestion; fast async |
| Stock → recommendation | Async event listener with deduplication | Fast response; decoupled; idempotent |
| Sprint 2 seam | Strategy pattern + @Component @Qualifier | New strategy = implement interface + annotate |

