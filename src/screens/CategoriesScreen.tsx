import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/Header";
import { ScreenState } from "../components";
import { useCategories } from "../hooks/useCategories";
import { useColors } from "../hooks/useColors";
import { styles } from "../styles";

function toSlug(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function CategoriesScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { categories, loading, error, retry } = useCategories();

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      {loading || error || !categories.length ? (
        <ScreenState
          colors={colors}
          loading={loading}
          error={error}
          empty={!loading && !error ? "No categories found" : undefined}
          onRetry={retry}
        />
      ) : (
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={(category) => category}
          contentContainerStyle={localStyles.list}
          columnWrapperStyle={localStyles.row}
          ListHeaderComponent={
            <Header
              title="All categories"
              subtitle="Browse every creative collection"
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate("Main", {
                  screen: "Explore",
                  params: { category: toSlug(item) },
                })
              }
              style={({ pressed }) => [
                localStyles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View
                style={[
                  localStyles.icon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text
                numberOfLines={2}
                style={[localStyles.name, { color: colors.text }]}
              >
                {item}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  row: { gap: 12 },
  card: {
    flex: 1,
    minHeight: 92,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { flex: 1, fontSize: 15, fontWeight: "700" },
});
