import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppColors } from "../theme";

const requirements = [
  { label: "8+ characters", test: (value: string) => value.length >= 8 },
  {
    label: "Upper & lowercase",
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: "A number", test: (value: string) => /\d/.test(value) },
  {
    label: "A symbol",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

export function PasswordStrength({
  password,
  colors,
}: {
  password: string;
  colors: AppColors;
}) {
  const checks = useMemo(
    () => requirements.map((requirement) => requirement.test(password)),
    [password],
  );
  const score = checks.filter(Boolean).length;
  const strength = [
    { label: "Weak", color: colors.danger },
    { label: "Weak", color: colors.danger },
    { label: "Fair", color: "#D97706" },
    { label: "Good", color: colors.primary },
    { label: "Strong", color: colors.success },
  ][score];

  if (!password) return null;

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Password strength: ${strength.label}`}
    >
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.muted }]}>Strength</Text>
        <Text style={[styles.value, { color: strength.color }]}>
          {strength.label}
        </Text>
      </View>
      <View style={styles.meter}>
        {requirements.map((requirement, index) => (
          <View
            key={requirement.label}
            style={[
              styles.segment,
              {
                backgroundColor: index < score ? strength.color : colors.border,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.requirements}>
        {requirements.map((requirement, index) => (
          <View key={requirement.label} style={styles.requirement}>
            <Ionicons
              name={checks[index] ? "checkmark-circle" : "ellipse-outline"}
              size={15}
              color={checks[index] ? colors.success : colors.muted}
            />
            <Text style={[styles.requirementText, { color: colors.muted }]}>
              {requirement.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 9, marginTop: -8 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 12, fontWeight: "600" },
  value: { fontSize: 12, fontWeight: "800" },
  meter: { flexDirection: "row", gap: 6 },
  segment: { flex: 1, height: 5, borderRadius: 3 },
  requirements: { flexDirection: "row", flexWrap: "wrap", rowGap: 6 },
  requirement: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  requirementText: { fontSize: 11 },
});
