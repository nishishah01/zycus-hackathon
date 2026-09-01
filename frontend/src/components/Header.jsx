import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, shadows } from "../styles/theme";

export default function Header({ pendingCount }) {
  return (
    <View style={[styles.hero, shadows.hero]}>
      <View style={styles.heroTextContainer}>
        <Text style={styles.title}>StockPulse</Text>
        <Text style={styles.subtitle}>
          AI-powered merchandising advisor
        </Text>
      </View>

      <View style={styles.headerBadge}>
        <Text style={styles.headerBadgeText}>
          {pendingCount} Pending
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.heroBg,
    padding: 28,
    borderRadius: 20,
    marginBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  heroTextContainer: {
    flex: 1,
    minWidth: 200,
  },
  title: {
    fontSize: 34,
    color: "#ffffff",
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 6,
    color: "#e9d5ff",
    fontSize: 15,
    fontWeight: "500",
  },
  headerBadge: {
    backgroundColor: colors.purplePrimary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
  },
  headerBadgeText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});
