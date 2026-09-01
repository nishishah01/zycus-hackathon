import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../styles/theme";

export default function MessageBanner({ message }) {
  if (!message) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.successBorder,
  },
  bannerText: {
    color: colors.successText,
    fontWeight: "600",
    fontSize: 14,
  },
});
