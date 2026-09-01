import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import TriggerBadges from "./TriggerBadges";
import { colors, shadows } from "../styles/theme";

export default function RecommendationCard({
  suggestion,
  type, // "PRICING" | "REORDER"
  onAccept,
  onReject,
}) {
  const isPricing = type === "PRICING";

  return (
    <View style={[styles.card, shadows.card]}>
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.productName}>{suggestion.product?.name}</Text>
          <TriggerBadges triggerReason={suggestion.triggerReason} />
        </View>

        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>PENDING</Text>
        </View>
      </View>

      {/* Content depending on Pricing or Reorder */}
      {isPricing ? (
        <View style={styles.priceComparison}>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>CURRENT PRICE</Text>
            <Text style={styles.priceVal}>
              ₹{Number(suggestion.currentPrice).toLocaleString("en-IN")}
            </Text>
          </View>

          <Text style={styles.priceArrow}>→</Text>

          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>AI RECOMMENDED</Text>
            <Text style={[styles.priceVal, styles.recommendedPrice]}>
              ₹{Number(suggestion.recommendedPrice).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.reorderBlock}>
          <Text style={styles.reorderLabel}>RECOMMENDED QUANTITY</Text>
          <View style={styles.reorderQtyRow}>
            <Text style={styles.reorderQty}>
              {suggestion.recommendedQuantity}
            </Text>
            <Text style={styles.reorderUnits}>units</Text>
          </View>
        </View>
      )}

      {/* Additional Stats */}
      {isPricing ? (
        <Text style={styles.directionText}>
          <Text style={styles.boldText}>Direction: </Text>
          {suggestion.direction}
        </Text>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>CURRENT STOCK</Text>
            <Text style={styles.statValue}>{suggestion.currentStock}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>LEAD TIME</Text>
            <Text style={styles.statValue}>
              {suggestion.suggestedLeadTimeDays} days
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>CONFIDENCE</Text>
            <Text style={styles.statValue}>
              {(suggestion.confidence * 100).toFixed(0)}%
            </Text>
          </View>
        </View>
      )}

      {/* Confidence for Pricing */}
      {isPricing && (
        <Text style={styles.confidenceText}>
          Confidence:{" "}
          <Text style={styles.boldText}>
            {(suggestion.confidence * 100).toFixed(0)}%
          </Text>
        </Text>
      )}

      {/* AI Reasoning Box */}
      <View style={styles.reasoningBox}>
        <Text style={styles.reasoningHeader}>AI REASONING</Text>
        <Text style={styles.reasoningContent}>{suggestion.reasoning}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => onAccept(suggestion.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptBtnText}>
            {isPricing ? "✓ Accept Price" : "✓ Accept Reorder"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => onReject(suggestion.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.rejectBtnText}>✕ Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 18,
    borderLeftWidth: 5,
    borderLeftColor: colors.purplePrimary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  titleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pendingBadge: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingBadgeText: {
    color: colors.warningText,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  priceComparison: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginVertical: 20,
  },
  priceCol: {
    gap: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  priceVal: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  recommendedPrice: {
    color: colors.successBorder,
  },
  priceArrow: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: "300",
  },
  reorderBlock: {
    backgroundColor: colors.purpleSoft,
    padding: 16,
    borderRadius: 14,
    marginVertical: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.purpleDark,
  },
  reorderLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  reorderQtyRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 6,
  },
  reorderQty: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.purpleDark,
    marginRight: 8,
  },
  reorderUnits: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  directionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.purpleSoft,
    padding: 10,
    borderRadius: 10,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "700",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  reasoningBox: {
    backgroundColor: colors.purpleSoft,
    borderLeftWidth: 4,
    borderLeftColor: colors.purplePrimary,
    padding: 16,
    borderRadius: 12,
    marginVertical: 14,
  },
  reasoningHeader: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  reasoningContent: {
    color: colors.textSecondary,
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: colors.purpleDark,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  acceptBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: colors.buttonReject,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: colors.buttonReject,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  rejectBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});
