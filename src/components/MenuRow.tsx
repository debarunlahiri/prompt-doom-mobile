import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text } from "react-native";
import { styles } from "../styles";
import { AppColors } from "../theme";

export function MenuRow({
  colors,
  label,
  icon,
  onPress,
  danger,
}: {
  colors: AppColors;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <Ionicons
        name={icon}
        size={22}
        color={danger ? colors.danger : colors.primary}
      />
      <Text
        style={{
          color: danger ? colors.danger : colors.text,
          flex: 1,
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={19} color={colors.muted} />
    </Pressable>
  );
}
