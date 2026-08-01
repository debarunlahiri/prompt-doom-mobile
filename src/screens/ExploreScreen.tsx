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
import { formatSlug } from "../utils/format";

export function ExploreScreen({ showHeader = true }: { showHeader?: boolean }) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const route = useRoute<any>();
  const category = route.params?.category;
  const tag = route.params?.tag;
  const results = usePagedImages({ q: submitted || undefined, category, tag });
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      {showHeader && (
        <Header
          onBack={
            category || tag
              ? () => {
                  if (navigation.canGoBack()) navigation.goBack();
                  else navigation.navigate("Home");
                }
              : undefined
          }
          title={
            category ? formatSlug(category) : tag ? formatSlug(tag) : "Explore"
          }
          subtitle={
            category
              ? "Browse images in this category"
              : tag
                ? "Browse images with this tag"
                : "Find your next creative spark"
          }
        />
      )}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => setSubmitted(query.trim())}
          returnKeyType="search"
          placeholder="Search by title or keyword"
          placeholderTextColor={colors.muted}
          style={{ flex: 1, color: colors.text, fontSize: 15 }}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery("");
              setSubmitted("");
            }}
          >
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {results.loading || results.error || !results.items.length ? (
        <ScreenState
          colors={colors}
          loading={results.loading}
          error={results.error}
          empty={
            !results.loading && !results.error
              ? "No matching images"
              : undefined
          }
          onRetry={results.retry}
        />
      ) : (
        <ImageGrid
          data={results.items}
          colors={colors}
          onPress={(item) =>
            navigation.navigate("ImageDetail", { imageId: item.id })
          }
          onEndReached={results.loadMore}
          onRefresh={results.refresh}
          refreshing={results.refreshing}
          footerLoading={results.loadingMore}
        />
      )}
    </SafeAreaView>
  );
}
