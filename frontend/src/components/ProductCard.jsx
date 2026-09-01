import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { colors, shadows } from "../styles/theme";

export default function ProductCard({
  product,
  loadingId,
  onOrderProduct,
  onSuggestPricing,
  onSuggestReorder,
}) {
  const [showManual, setShowManual] = useState(false);

  const lowStock = product.stockLevel < product.reorderThreshold;
  const demandSpike = product.demandVelocity >= 10;
  const isLoading = loadingId === product.id;

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return { bg: colors.successBg, text: colors.successText };
      case "PRICE_REVIEW_PENDING":
        return { bg: colors.warningBg, text: colors.warningText };
      case "OUT_OF_STOCK":
        return { bg: colors.dangerBg, text: colors.dangerText };
      default:
        return { bg: colors.borderLight, text: colors.textSecondary };
    }
  };

  const statusStyle = getStatusStyle(product.status);

  return (
    <View style={[styles.card, shadows.card]}>
      {/* Product Top Info */}
      <View style={styles.productTop}>
        <View style={styles.nameContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.sku}>{product.sku}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {product.status.replaceAll("_", " ")}
          </Text>
        </View>
      </View>

      {/* Product Price */}
      <Text style={styles.price}>
        ₹{Number(product.currentPrice).toLocaleString("en-IN")}
      </Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>STOCK</Text>
          <Text
            style={[
              styles.statValue,
              lowStock ? styles.dangerNumber : null,
            ]}
          >
            {product.stockLevel}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>THRESHOLD</Text>
          <Text style={styles.statValue}>{product.reorderThreshold}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>DEMAND</Text>
          <Text
            style={[
              styles.statValue,
              demandSpike ? styles.dangerNumber : null,
            ]}
          >
            {product.demandVelocity}
          </Text>
        </View>
      </View>

      {/* Warning Signals */}
      {(lowStock || demandSpike) && (
        <View style={styles.signalsContainer}>
          {lowStock && (
            <View style={[styles.signalPill, styles.signalLow]}>
              <Text style={styles.signalLowText}>⚠ Inventory Low</Text>
            </View>
          )}

          {demandSpike && (
            <View style={[styles.signalPill, styles.signalSpike]}>
              <Text style={styles.signalSpikeText}>↑ Demand Spike</Text>
            </View>
          )}
        </View>
      )}

      {/* Main Simulate Button */}
      <TouchableOpacity
        style={[styles.simulateBtn, isLoading && styles.btnDisabled]}
        onPress={() => onOrderProduct(product.id)}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <View style={styles.btnRow}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.simulateBtnText}> Processing Sale...</Text>
          </View>
        ) : (
          <Text style={styles.simulateBtnText}>🛒 Simulate Sale</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.demoHint}>
        Sale → inventory event → AI recommendation
      </Text>

      {/* Manual Controls Accordion */}
      <View style={styles.manualSection}>
        <TouchableOpacity
          onPress={() => setShowManual(!showManual)}
          style={styles.manualToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.manualToggleText}>
            {showManual ? "▼ MANUAL CONTROLS" : "▶ MANUAL CONTROLS"}
          </Text>
        </TouchableOpacity>

        {showManual && (
          <View style={styles.manualButtons}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => onSuggestPricing(product.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Suggest Pricing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => onSuggestReorder(product.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Suggest Reorder</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 22,
    marginBottom: 20,
    borderTopWidth: 4,
    borderTopColor: colors.purplePrimary,
  },
  productTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  nameContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  sku: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.textPrimary,
    marginVertical: 16,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.purpleSoft,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.purplePrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  dangerNumber: {
    color: colors.dangerNumber,
  },
  signalsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 10,
  },
  signalPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  signalLow: {
    backgroundColor: colors.dangerBg,
  },
  signalLowText: {
    color: colors.dangerText,
    fontSize: 12,
    fontWeight: "700",
  },
  signalSpike: {
    backgroundColor: colors.warningBg,
  },
  signalSpikeText: {
    color: colors.warningText,
    fontSize: 12,
    fontWeight: "700",
  },
  simulateBtn: {
    backgroundColor: colors.heroBg,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: colors.heroBg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  simulateBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  demoHint: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
    fontWeight: "500",
  },
  manualSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
    marginTop: 6,
  },
  manualToggle: {
    paddingVertical: 4,
  },
  manualToggleText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  manualButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.buttonSecondaryBg,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: colors.buttonSecondaryText,
    fontSize: 13,
    fontWeight: "600",
  },
});
