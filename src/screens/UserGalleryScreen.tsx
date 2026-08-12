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
import { GoogleSignInPrompt } from "../components/GoogleSignInPrompt";
import { MenuRow } from "../components/MenuRow";
import { PromptCard } from "../components/PromptCard";
import { APP_NAME, LEGAL_CONTENT } from "../config";
import { useColors } from "../hooks/useColors";
import { openImageWithInterstitial } from "../services/adService";
import { useAppStore } from "../store";
import { styles } from "../styles";
import { GalleryImage, User } from "../types";
import { usePagedImages } from "../usePagedImages";

export function UserGalleryScreen({ history = false }: { history?: boolean }) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const user = useAppStore((state) => state.user);
  const setFavorite = useAppStore((state) => state.setFavorite);
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(
    async (nextPage = 1) => {
      if (!user) {
        setLoading(false);
        return;
      }
      if (nextPage === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const response = history
          ? await userApi.history(nextPage)
          : await userApi.favorites(nextPage);
        const next = response.items;
        setItems((current) =>
          nextPage === 1
            ? next
            : [
                ...current,
                ...next.filter(
                  (item: GalleryImage) =>
                    !current.some((existing) => existing.id === item.id),
                ),
              ],
        );
        setPage(nextPage);
        if (history) {
          setHasMore("hasMore" in response && response.hasMore);
        } else {
          setHasMore(
            "pagination" in response &&
              nextPage < (response.pagination.totalPages ?? nextPage),
          );
        }
        if (!history)
          next.forEach((image: GalleryImage) => setFavorite(image.id, true));
        setError("");
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [history, user?.id],
  );
  useFocusEffect(
    useCallback(() => {
      void load(1);
    }, [load]),
  );
  if (!user)
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <Header title={history ? "History" : "Favourites"} />
        <GoogleSignInPrompt
          colors={colors}
          title={history ? "Your history awaits" : "Your favourites await"}
          description={
            history
              ? "Continue with Google to sync and revisit the prompts you have explored."
              : "Continue with Google to save and sync your favourite inspiration."
          }
        />
      </SafeAreaView>
    );
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <Header
        title={history ? "Recently viewed" : "Favourites"}
        subtitle={
          history ? "Prompts you opened or copied" : "Your saved inspiration"
        }
      />
      {loading || error || !items.length ? (
        <ScreenState
          colors={colors}
          loading={loading}
          error={error}
          empty={
            !loading && !error
              ? history
                ? "No recent prompts"
                : "No favourites yet"
              : undefined
          }
          onRetry={() => load(1)}
        />
      ) : (
        <ImageGrid
          data={items}
          colors={colors}
          onPress={(item) =>
            void openImageWithInterstitial(() =>
              navigation.navigate("ImageDetail", { imageId: item.id }),
            ).catch(() => undefined)
          }
          onRefresh={() => load(1)}
          refreshing={loading}
          onEndReached={() => {
            if (hasMore && !loadingMore) void load(page + 1);
          }}
          footerLoading={loadingMore}
        />
      )}
    </SafeAreaView>
  );
}
