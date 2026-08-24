import { useEffect, useState } from "react";

const API = "http://localhost:8080";

function App() {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [productsRes, pricingRes, reorderRes] = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/pricing-suggestions`),
        fetch(`${API}/reorder-suggestions`),
      ]);

      if (!productsRes.ok || !pricingRes.ok || !reorderRes.ok) {
        throw new Error("Backend request failed");
      }

      setProducts(await productsRes.json());
      setPricingSuggestions(await pricingRes.json());
      setReorderSuggestions(await reorderRes.json());
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to backend.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const orderProduct = async (id) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/products/${id}/orders?quantity=1`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Order failed");
      }

      setMessage(
        "Order completed. Inventory updated successfully."
      );

      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Order failed.");
    } finally {
      setLoading(false);
    }
  };

  const suggestPricing = async (id) => {
    try {
      const response = await fetch(
        `${API}/products/${id}/suggest-pricing`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Pricing suggestion failed");
      }

      setMessage("Pricing suggestion generated.");
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Could not generate pricing suggestion.");
    }
  };

  const suggestReorder = async (id) => {
    try {
      const response = await fetch(
        `${API}/products/${id}/suggest-reorder`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Reorder suggestion failed");
      }

      setMessage("Reorder suggestion generated.");
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Could not generate reorder suggestion.");
    }
  };

  const updatePricing = async (id, accept) => {
    try {
      const response = await fetch(
        `${API}/pricing-suggestions/${id}?accept=${accept}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Pricing update failed");
      }

      setMessage(
        accept
          ? "Pricing recommendation accepted."
          : "Pricing recommendation rejected."
      );

      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Could not update pricing recommendation.");
    }
  };

  const updateReorder = async (id, accept) => {
    try {
      const response = await fetch(
        `${API}/reorder-suggestions/${id}?accept=${accept}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Reorder update failed");
      }

      setMessage(
        accept
          ? "Reorder recommendation accepted."
          : "Reorder recommendation rejected."
      );

      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Could not update reorder recommendation.");
    }
  };

  const pendingPricing = pricingSuggestions.filter(
    (s) => s.status === "PENDING"
  );

  const pendingReorder = reorderSuggestions.filter(
    (s) => s.status === "PENDING"
  );

  const historyPricing = pricingSuggestions.filter(
    (s) => s.status !== "PENDING"
  );

  const historyReorder = reorderSuggestions.filter(
    (s) => s.status !== "PENDING"
  );

  const pendingCount =
    pendingPricing.length + pendingReorder.length;

  const triggerLabel = (triggerReason) => {
    if (triggerReason === "INVENTORY_LOW") {
      return "AUTO · INVENTORY LOW";
    }

    if (triggerReason === "DEMAND_SPIKE") {
      return "AUTO · DEMAND SPIKE";
    }

    return "MANUAL";
  };

  return (
    <div className="app">

      {/* HEADER */}

      <header className="hero">
        <div>
          <h1>StockPulse</h1>
          <p>AI-powered merchandising console</p>
        </div>

        <div className="header-badge">
          {pendingCount} Pending
        </div>
      </header>

      {/* MESSAGE */}

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {/* INVENTORY */}

      <section>
        <div className="section-header">
          <div>
            <h2>Inventory</h2>
            <p>Live product inventory and demand signals</p>
          </div>
        </div>

        <div className="product-grid">

          {products.map((product) => (

            <div className="card product-card" key={product.id}>

              <div className="product-top">

                <div>
                  <h3>{product.name}</h3>

                  <p className="sku">
                    {product.sku}
                  </p>
                </div>

                <span
                  className={`status ${product.status}`}
                >
                  {product.status.replaceAll("_", " ")}
                </span>

              </div>

              <div className="product-price">
                ₹{product.currentPrice.toLocaleString("en-IN")}
              </div>

              <div className="stats">

                <div>
                  <span>Stock</span>
                  <strong>{product.stockLevel}</strong>
                </div>

                <div>
                  <span>Threshold</span>
                  <strong>{product.reorderThreshold}</strong>
                </div>

                <div>
                  <span>Demand</span>
                  <strong>{product.demandVelocity}</strong>
                </div>

              </div>

              <div className="buttons">

                <button
                  onClick={() => orderProduct(product.id)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Order 1"}
                </button>

                <button
                  className="secondary"
                  onClick={() =>
                    suggestPricing(product.id)
                  }
                >
                  Suggest Pricing
                </button>

                <button
                  className="secondary"
                  onClick={() =>
                    suggestReorder(product.id)
                  }
                >
                  Suggest Reorder
                </button>

              </div>

            </div>

          ))}

        </div>
      </section>

      {/* PENDING RECOMMENDATIONS */}

      <section>

        <div className="section-header">

          <div>
            <h2>Pending Recommendations</h2>

            <p>
              AI recommendations waiting for merchandising approval
            </p>
          </div>

          <div className="pending-badge">
            {pendingCount}
          </div>

        </div>

        {pendingCount === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✓</div>

            <h3>No pending recommendations</h3>

            <p>
              Your inventory is currently waiting for a
              recommendation trigger.
            </p>
          </div>
        )}

        {/* PRICING */}

        {pendingPricing.length > 0 && (
          <div className="recommendation-group">

            <h3 className="group-title">
              💰 Pricing Recommendations
            </h3>

            {pendingPricing.map((suggestion) => (

              <div
                className="suggestion recommendation-card"
                key={suggestion.id}
              >

                <div className="recommendation-header">

                  <div>
                    <h3>
                      {suggestion.product.name}
                    </h3>

                    <span className="trigger">
                      {triggerLabel(
                        suggestion.triggerReason
                      )}
                    </span>
                  </div>

                  <span className="pending-label">
                    PENDING
                  </span>

                </div>

                <div className="price-comparison">

                  <div>
                    <span>Current price</span>

                    <strong>
                      ₹
                      {suggestion.currentPrice.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div className="arrow">
                    →
                  </div>

                  <div>
                    <span>AI recommended</span>

                    <strong className="recommended">
                      ₹
                      {suggestion.recommendedPrice.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                </div>

                <p>
                  <b>Direction:</b>{" "}
                  {suggestion.direction}
                </p>

                <div className="confidence">
                  Confidence:{" "}
                  <strong>
                    {(suggestion.confidence * 100).toFixed(0)}%
                  </strong>
                </div>

                <div className="reasoning">
                  <strong>AI reasoning</strong>

                  <p>
                    {suggestion.reasoning}
                  </p>
                </div>

                <div className="buttons">

                  <button
                    onClick={() =>
                      updatePricing(
                        suggestion.id,
                        true
                      )
                    }
                  >
                    Accept Price
                  </button>

                  <button
                    className="reject"
                    onClick={() =>
                      updatePricing(
                        suggestion.id,
                        false
                      )
                    }
                  >
                    Reject
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

        {/* REORDER */}

        {pendingReorder.length > 0 && (
          <div className="recommendation-group">

            <h3 className="group-title">
              📦 Reorder Recommendations
            </h3>

            {pendingReorder.map((suggestion) => (

              <div
                className="suggestion recommendation-card"
                key={suggestion.id}
              >

                <div className="recommendation-header">

                  <div>
                    <h3>
                      {suggestion.product.name}
                    </h3>

                    <span className="trigger">
                      {triggerLabel(
                        suggestion.triggerReason
                      )}
                    </span>
                  </div>

                  <span className="pending-label">
                    PENDING
                  </span>

                </div>

                <div className="reorder-number">

                  <span>Recommended quantity</span>

                  <strong>
                    {suggestion.recommendedQuantity}
                  </strong>

                  <span>units</span>

                </div>

                <div className="stats">

                  <div>
                    <span>Current stock</span>
                    <strong>
                      {suggestion.currentStock}
                    </strong>
                  </div>

                  <div>
                    <span>Lead time</span>
                    <strong>
                      {suggestion.suggestedLeadTimeDays} days
                    </strong>
                  </div>

                  <div>
                    <span>Confidence</span>
                    <strong>
                      {(suggestion.confidence * 100).toFixed(
                        0
                      )}
                      %
                    </strong>
                  </div>

                </div>

                <div className="reasoning">
                  <strong>AI reasoning</strong>

                  <p>
                    {suggestion.reasoning}
                  </p>
                </div>

                <div className="buttons">

                  <button
                    onClick={() =>
                      updateReorder(
                        suggestion.id,
                        true
                      )
                    }
                  >
                    Accept Reorder
                  </button>

                  <button
                    className="reject"
                    onClick={() =>
                      updateReorder(
                        suggestion.id,
                        false
                      )
                    }
                  >
                    Reject
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </section>

      {/* HISTORY */}

      {(historyPricing.length > 0 ||
        historyReorder.length > 0) && (

        <section>

          <div className="section-header">

            <div>
              <h2>History</h2>

              <p>
                Previously processed recommendations
              </p>
            </div>

          </div>

          <div className="history-grid">

            {historyPricing.map((suggestion) => (

              <div
                className="history-card"
                key={suggestion.id}
              >

                <div>
                  <strong>
                    💰 {suggestion.product.name}
                  </strong>

                  <p>
                    Price recommendation
                  </p>
                </div>

                <span
                  className={`history-status ${suggestion.status}`}
                >
                  {suggestion.status}
                </span>

              </div>

            ))}

            {historyReorder.map((suggestion) => (

              <div
                className="history-card"
                key={suggestion.id}
              >

                <div>
                  <strong>
                    📦 {suggestion.product.name}
                  </strong>

                  <p>
                    Reorder:{" "}
                    {suggestion.recommendedQuantity} units
                  </p>
                </div>

                <span
                  className={`history-status ${suggestion.status}`}
                >
                  {suggestion.status}
                </span>

              </div>

            ))}

          </div>

        </section>

      )}

    </div>
  );
}

export default App;