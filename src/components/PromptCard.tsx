import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles";
import { AppColors } from "../theme";

export function PromptCard({
  colors,
  title,
  text,
  onCopy,
}: {
  colors: AppColors;
  title: string;
  text: string;
  onCopy: () => void;
}) {
  return (
    <View
      style={[
        styles.promptCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.sectionTitle, { color: colors.text, flex: 1 }]}>
          {title}
        </Text>
        <Pressable onPress={onCopy}>
          <Ionicons name="copy-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>
      <Text selectable style={{ color: colors.text, lineHeight: 24 }}>
        {text}
      </Text>
    </View>
  );
}
