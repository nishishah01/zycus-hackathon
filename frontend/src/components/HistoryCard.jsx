import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TriggerBadges from "./TriggerBadges";
import { colors, shadows } from "../styles/theme";

export default function HistoryCard({ suggestion, type }) {
  const isPricing = type === "PRICING";
  const isAccepted = suggestion.status === "ACCEPTED";

  return (
    <View style={[styles.card, shadows.card]}>
      <View style={styles.leftContent}>
        <Text style={styles.title}>
          {isPricing ? "💰 " : "📦 "}
          {suggestion.product?.name}
        </Text>

        <Text style={styles.subtitle}>
          {isPricing
            ? "Price recommendation"
            : `Reorder: ${suggestion.recommendedQuantity} units`}
        </Text>

        <TriggerBadges triggerReason={suggestion.triggerReason} />
      </View>

      <View
        style={[
          styles.statusBadge,
          isAccepted ? styles.acceptedBadge : styles.rejectedBadge,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            isAccepted ? styles.acceptedText : styles.rejectedText,
          ]}
        >
          {suggestion.status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: colors.borderLight,
    gap: 12,
  },
  leftContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  acceptedBadge: {
    backgroundColor: colors.successBg,
  },
  acceptedText: {
    color: colors.successText,
  },
  rejectedBadge: {
    backgroundColor: colors.dangerBg,
  },
  rejectedText: {
    color: colors.dangerText,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
