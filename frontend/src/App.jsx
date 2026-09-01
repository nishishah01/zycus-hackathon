import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StatusBar,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import Header from "./components/Header";
import MessageBanner from "./components/MessageBanner";
import ProductCard from "./components/ProductCard";
import RecommendationCard from "./components/RecommendationCard";
import HistoryCard from "./components/HistoryCard";
import { colors } from "./styles/theme";

const API = Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

export default function App() {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // -----------------------------
  // SIMULATE SALE
  // -----------------------------

  const orderProduct = async (id) => {
    setLoadingId(id);
    setMessage("");

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
        "Sale recorded. Inventory signal sent to the recommendation engine."
      );

      // Give @Async listener a moment to generate suggestions
      await new Promise((resolve) => setTimeout(resolve, 700));

      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Sale could not be processed.");
    } finally {
      setLoadingId(null);
    }
  };

  // -----------------------------
  // MANUAL ACTIONS
  // -----------------------------

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

      setMessage("Manual pricing suggestion generated.");
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

      setMessage("Manual reorder suggestion generated.");
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Could not generate reorder suggestion.");
    }
  };

  // -----------------------------
  // APPROVAL ACTIONS
  // -----------------------------

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
          ? "Pricing recommendation accepted. Product price updated."
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
          ? "Reorder recommendation accepted. Inventory updated."
          : "Reorder recommendation rejected."
      );

      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Could not update reorder recommendation.");
    }
  };

  // -----------------------------
  // FILTERS
  // -----------------------------

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

  const pendingCount = pendingPricing.length + pendingReorder.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.heroBg} />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.purplePrimary]} />
        }
      >
        {/* ================= HEADER ================= */}
        <Header pendingCount={pendingCount} />

        {/* ================= MESSAGE ================= */}
        <MessageBanner message={message} />

        {/* ================= INVENTORY ================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Inventory</Text>
              <Text style={styles.sectionSubtitle}>
                Simulate a sale and let StockPulse automatically detect inventory signals.
              </Text>
            </View>
          </View>

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              loadingId={loadingId}
              onOrderProduct={orderProduct}
              onSuggestPricing={suggestPricing}
              onSuggestReorder={suggestReorder}
            />
          ))}
        </View>

        {/* ================= PENDING RECOMMENDATIONS ================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithBadge}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>Pending Recommendations</Text>
              <Text style={styles.sectionSubtitle}>
                AI recommendations waiting for merchandising approval
              </Text>
            </View>

            <View style={styles.pendingBadgeCircle}>
              <Text style={styles.pendingBadgeCircleText}>{pendingCount}</Text>
            </View>
          </View>

          {pendingCount === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyTitle}>No pending recommendations</Text>
              <Text style={styles.emptySubtitle}>
                Simulate a sale to trigger the recommendation engine.
              </Text>
            </View>
          )}

          {/* Pricing Recommendations */}
          {pendingPricing.length > 0 && (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>💰 Pricing Recommendations</Text>
              {pendingPricing.map((suggestion) => (
                <RecommendationCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  type="PRICING"
                  onAccept={(id) => updatePricing(id, true)}
                  onReject={(id) => updatePricing(id, false)}
                />
              ))}
            </View>
          )}

          {/* Reorder Recommendations */}
          {pendingReorder.length > 0 && (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>📦 Reorder Recommendations</Text>
              {pendingReorder.map((suggestion) => (
                <RecommendationCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  type="REORDER"
                  onAccept={(id) => updateReorder(id, true)}
                  onReject={(id) => updateReorder(id, false)}
                />
              ))}
            </View>
          )}
        </View>

        {/* ================= HISTORY ================= */}
        {(historyPricing.length > 0 || historyReorder.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>History</Text>
                <Text style={styles.sectionSubtitle}>
                  Previously processed recommendations
                </Text>
              </View>
            </View>

            <View style={styles.historyList}>
              {historyPricing.map((suggestion) => (
                <HistoryCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  type="PRICING"
                />
              ))}

              {historyReorder.map((suggestion) => (
                <HistoryCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  type="REORDER"
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionHeaderWithBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  pendingBadgeCircle: {
    backgroundColor: colors.purplePrimary,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  pendingBadgeCircleText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
  group: {
    marginTop: 12,
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 14,
  },
  emptyState: {
    backgroundColor: colors.purpleSoft,
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
    color: colors.purplePrimary,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  historyList: {
    marginTop: 8,
  },
});