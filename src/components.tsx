import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { AppColors } from "./theme";
import { GalleryImage } from "./types";

export function ScreenState({
  colors,
  loading,
  error,
  empty,
  onRetry,
}: {
  colors: AppColors;
  loading?: boolean;
  error?: string;
  empty?: string;
  onRetry?: () => void;
}) {
  if (loading)
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.stateText, { color: colors.muted }]}>
          Loading…
        </Text>
      </View>
    );
  if (error)
    return (
      <View style={styles.state}>
        <Ionicons name="cloud-offline-outline" size={42} color={colors.muted} />
        <Text style={[styles.stateTitle, { color: colors.text }]}>
          Couldn’t load this
        </Text>
        <Text style={[styles.stateText, { color: colors.muted }]}>{error}</Text>
        {onRetry && (
          <Button
            colors={colors}
            title="Try again"
            icon="refresh"
            onPress={onRetry}
          />
        )}
      </View>
    );
  if (empty)
    return (
      <View style={styles.state}>
        <Ionicons name="images-outline" size={42} color={colors.muted} />
        <Text style={[styles.stateTitle, { color: colors.text }]}>{empty}</Text>
        <Text style={[styles.stateText, { color: colors.muted }]}>
          There’s nothing to show here yet.
        </Text>
      </View>
    );
  return null;
}

export function Button({
  colors,
  title,
  onPress,
  icon,
  variant = "primary",
  disabled,
}: {
  colors: AppColors;
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const backgroundColor =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
        ? colors.danger
        : colors.surfaceAlt;
  const color = variant === "secondary" ? colors.text : "#FFFFFF";
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled ? 0.5 : pressed ? 0.78 : 1 },
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={color} />}
      <Text style={[styles.buttonText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({
  colors,
  label,
  error,
  icon,
  ...props
}: TextInputProps & {
  colors: AppColors;
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        {icon && <Ionicons name={icon} size={19} color={colors.muted} />}
        <TextInput
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text }]}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
}

export function ImageCard({
  item,
  colors,
  onPress,
}: {
  item: GalleryImage;
  colors: AppColors;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, opacity: pressed ? 0.84 : 1 },
      ]}
    >
      <Image
        source={{ uri: item.thumbnailUrl || item.imageUrl }}
        style={styles.cardImage}
        contentFit="cover"
        transition={180}
        cachePolicy="memory-disk"
      />
      <View style={styles.cardBody}>
        <Text
          numberOfLines={1}
          style={[styles.cardTitle, { color: colors.text }]}
        >
          {item.title}
        </Text>
        <Text numberOfLines={1} style={[styles.meta, { color: colors.muted }]}>
          {item.category?.name ?? item.aiModel ?? "AI artwork"}
        </Text>
      </View>
    </Pressable>
  );
}

export function ImageGrid({
  data,
  colors,
  onPress,
  onEndReached,
  refreshing,
  onRefresh,
  footerLoading,
}: {
  data: GalleryImage[];
  colors: AppColors;
  onPress: (item: GalleryImage) => void;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  footerLoading?: boolean;
}) {
  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => String(item.id)}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => (
        <ImageCard item={item} colors={colors} onPress={() => onPress(item)} />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.35}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListFooterComponent={
        footerLoading ? (
          <ActivityIndicator style={styles.footer} color={colors.primary} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 28,
  },
  stateTitle: { fontSize: 19, fontWeight: "700", textAlign: "center" },
  stateText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonText: { fontSize: 15, fontWeight: "700" },
  fieldWrap: { gap: 7 },
  label: { fontSize: 14, fontWeight: "600" },
  inputWrap: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  error: { fontSize: 12 },
  grid: { padding: 16, paddingBottom: 36 },
  gridRow: { gap: 12 },
  card: { flex: 1, borderRadius: 18, overflow: "hidden", marginBottom: 12 },
  cardImage: { width: "100%", aspectRatio: 0.86, backgroundColor: "#D8D5DF" },
  cardBody: { padding: 11, gap: 3 },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  meta: { fontSize: 12 },
  footer: { paddingVertical: 20 },
});
