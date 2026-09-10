import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, { opacity: pressed ? 0.65 : 1 }]}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: danger ? `${colors.danger}14` : colors.primarySoft,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? colors.danger : colors.primary}
        />
      </View>
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
