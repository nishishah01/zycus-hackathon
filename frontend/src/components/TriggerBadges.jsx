import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../styles/theme";

export const getTriggerType = (triggerReason) => {
  if (
    triggerReason === "INVENTORY_LOW" ||
    triggerReason === "DEMAND_SPIKE"
  ) {
    return "AUTO";
  }
  return "MANUAL";
};

export const getTriggerLabel = (triggerReason) => {
  switch (triggerReason) {
    case "INVENTORY_LOW":
      return "INVENTORY LOW";
    case "DEMAND_SPIKE":
      return "DEMAND SPIKE";
    case "MANUAL":
      return "MANUAL";
    default:
      return triggerReason || "UNKNOWN";
  }
};

export default function TriggerBadges({ triggerReason }) {
  const type = getTriggerType(triggerReason);
  const label = getTriggerLabel(triggerReason);

  const isAuto = type === "AUTO";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          isAuto ? styles.badgeAuto : styles.badgeManual,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isAuto ? styles.badgeAutoText : styles.badgeManualText,
          ]}
        >
          {type}
        </Text>
      </View>

      <View style={[styles.badge, styles.badgeTrigger]}>
        <Text style={[styles.badgeText, styles.badgeTriggerText]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  badgeAuto: {
    backgroundColor: colors.badgeAutoBg,
  },
  badgeAutoText: {
    color: colors.badgeAutoText,
  },
  badgeManual: {
    backgroundColor: colors.badgeManualBg,
  },
  badgeManualText: {
    color: colors.badgeManualText,
  },
  badgeTrigger: {
    backgroundColor: colors.badgeTriggerBg,
  },
  badgeTriggerText: {
    color: colors.badgeTriggerText,
  },
});
