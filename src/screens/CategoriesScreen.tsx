import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getErrorMessage, imageApi } from "../api";
import { Header } from "../components/Header";
import { ScreenState } from "../components";
import { useColors } from "../hooks/useColors";
import { styles } from "../styles";

function toSlug(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function CategoriesScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const first = await imageApi.list({ page: 1, limit: 100 });
      const totalPages = first.pagination.totalPages ?? 1;
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
          imageApi.list({ page: index + 2, limit: 100 }),
        ),
      );
      const names = [first, ...remainingPages]
        .flatMap((page) => page.items)
        .map((item) => item.category?.name)
        .filter((name): name is string => Boolean(name));

      setCategories(
        Array.from(new Set(names)).sort((left, right) =>
          left.localeCompare(right),
        ),
      );
      setError("");
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
          onRetry={load}
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
