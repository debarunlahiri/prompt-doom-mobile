import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi, getErrorMessage, imageApi, userApi, adsApi } from "../api";
import {
  Button,
  Field,
  ImageCard,
  ImageGrid,
  ScreenState,
} from "../components";
import { Header } from "../components/Header";
import { MenuRow } from "../components/MenuRow";
import { PromptCard } from "../components/PromptCard";
import { APP_NAME, LEGAL_CONTENT } from "../config";
import { useColors } from "../hooks/useColors";
import { maybeShowAd, recordDetailClick } from "../services/adService";
import { useAppStore } from "../store";
import { styles } from "../styles";
import { GalleryImage, User } from "../types";
import { usePagedImages } from "../usePagedImages";

export function HomeScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { items, loading, error, retry, refresh, refreshing } =
    usePagedImages();
  const latest = useMemo(
    () =>
      [...items]
        .sort(
          (a, b) =>
            Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? ""),
        )
        .slice(0, 8),
    [items],
  );
  const trending = useMemo(
    () =>
      [...items]
        .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
        .slice(0, 8),
    [items],
  );
  const categories = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.category?.name).filter(Boolean)),
      ) as string[],
    [items],
  );
  const visibleCategories = categories.slice(0, 6);
  const section = (title: string, data: GalleryImage[]) => (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          styles.homeSectionTitle,
          { color: colors.text },
        ]}
      >
        {title}
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        data={data}
        keyExtractor={(item) => `${title}-${item.id}`}
        renderItem={({ item }) => (
          <View style={{ width: 170 }}>
            <ImageCard
              item={item}
              colors={colors}
              onPress={() =>
                navigation.navigate("ImageDetail", { imageId: item.id })
              }
            />
          </View>
        )}
      />
    </View>
  );
  if (loading || error)
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <Header title={APP_NAME} subtitle="Discover ideas worth creating" />
        <ScreenState
          colors={colors}
          loading={loading}
          error={error}
          onRetry={retry}
        />
      </SafeAreaView>
    );
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Header
          title={APP_NAME}
          subtitle="Discover ideas worth creating"
          action={
            <Pressable
              onPress={() => navigation.navigate("Notifications")}
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={colors.text}
              />
            </Pressable>
          }
        />
        <Pressable
          onPress={() => navigation.navigate("Search")}
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.muted} />
          <Text style={{ color: colors.muted }}>
            Search images, tags, or keywords
          </Text>
        </Pressable>
        <Text
          style={[
            styles.sectionTitle,
            styles.homeSectionTitle,
            { color: colors.text },
          ]}
        >
          Browse categories
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chips, styles.homeCategoryList]}
        >
          {categories.length ? (
            visibleCategories.map((category) => (
              <Pressable
                key={category}
                onPress={() =>
                  navigation.navigate("Explore", {
                    category: category.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                style={[styles.chip, { backgroundColor: colors.primarySoft }]}
              >
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  {category}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={{ color: colors.muted }}>
              Categories appear as images load.
            </Text>
          )}
          {categories.length > visibleCategories.length && (
            <Pressable
              onPress={() => navigation.navigate("Categories")}
              style={[
                styles.chip,
                styles.viewAllCategory,
                { borderColor: colors.primary },
              ]}
            >
              <Text style={{ color: colors.primary, fontWeight: "700" }}>
                View all
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </Pressable>
          )}
        </ScrollView>
        {section("Featured", trending.slice(0, 5))}
        {section("Trending now", trending)}
        {section("Latest", latest)}
      </ScrollView>
    </SafeAreaView>
  );
}
