import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useColors } from "../hooks/useColors";
import { styles } from "../styles";

export function Header({
  title,
  subtitle,
  action,
  onBack,
  showLogo = false,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onBack?: () => void;
  showLogo?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      {onBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
      )}
      {showLogo && !onBack && (
        <Image
          source={require("../../assets/prompt-doom-logo.png")}
          style={styles.headerLogo}
          contentFit="contain"
          accessibilityLabel="Prompt Doom logo"
        />
      )}
      <View style={{ flex: 1 }}>
        <Text style={[styles.heading, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
}
