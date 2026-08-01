import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { FullScreenImageViewer } from "../components/FullScreenImageViewer";
import { MenuRow } from "../components/MenuRow";
import { PromptCard } from "../components/PromptCard";
import { APP_NAME, LEGAL_CONTENT } from "../config";
import { useColors } from "../hooks/useColors";
import { maybeShowAd, recordDetailClick } from "../services/adService";
import { useAppStore } from "../store";
import { styles } from "../styles";
import { GalleryImage, User } from "../types";
import { usePagedImages } from "../usePagedImages";

export function ImageDetailScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { imageId } = useRoute<any>().params;
  const user = useAppStore((state) => state.user);
  const favoriteIds = useAppStore((state) => state.favoriteIds);
  const setFavorite = useAppStore((state) => state.setFavorite);
  const [image, setImage] = useState<GalleryImage>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerVisible, setViewerVisible] = useState(false);
  const favorite = favoriteIds.includes(imageId);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [details, favorites] = await Promise.all([
        imageApi.detail(imageId),
        user ? userApi.favorites(1, 100).catch(() => null) : null,
      ]);
      setImage(details);
      if (favorites) {
        favorites.items.forEach((item: GalleryImage) =>
          setFavorite(item.id, true),
        );
      }
      setError("");
      recordDetailClick();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [imageId, user?.id]);
  useEffect(() => {
    void load();
  }, [load]);
  const toggleFavorite = async () => {
    if (!user)
      return navigation.navigate("Login", { returnToImageId: imageId });
    setFavorite(imageId, !favorite);
    try {
      favorite
        ? await imageApi.removeFavorite(imageId)
        : await imageApi.addFavorite(imageId);
    } catch (e) {
      setFavorite(imageId, favorite);
      Alert.alert("Couldn’t update favourite", getErrorMessage(e));
    }
  };
  const shareImage = async () => {
    if (!image) return;
    try {
      await Share.share({
        title: image.title,
        message: `${image.title}\n${image.imageUrl ?? image.thumbnailUrl}`,
      });
      void imageApi.share(imageId, "system").catch(() => undefined);
    } catch {
      /* User cancelled. */
    }
  };
  if (loading || error || !image)
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: colors.background }]}
      >
        <ScreenState
          colors={colors}
          loading={loading}
          error={error}
          onRetry={load}
        />
      </SafeAreaView>
    );
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={`View ${image.title} full screen`}
        onPress={() => setViewerVisible(true)}
        style={styles.hero}
      >
        <Image
          source={{ uri: image.imageUrl ?? image.thumbnailUrl }}
          style={styles.heroImage}
          contentFit="cover"
          transition={220}
          cachePolicy="memory-disk"
        />
        <View style={styles.expandImageButton}>
          <Ionicons name="expand-outline" size={21} color="#FFFFFF" />
        </View>
      </Pressable>
      <View style={styles.detailBody}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.detailTitle, { color: colors.text }]}>
              {image.title}
            </Text>
            <Text style={{ color: colors.muted }}>
              {image.category?.name ?? "AI artwork"} ·{" "}
              {image.aiModel ?? "Unknown model"}
            </Text>
          </View>
          <Pressable
            onPress={toggleFavorite}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons
              name={favorite ? "heart" : "heart-outline"}
              size={23}
              color={favorite ? colors.danger : colors.text}
            />
          </Pressable>
          <Pressable
            onPress={shareImage}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons
              name="share-social-outline"
              size={23}
              color={colors.text}
            />
          </Pressable>
        </View>
        <View style={styles.stats}>
          <Text style={{ color: colors.muted }}>
            <Ionicons name="eye-outline" /> {image.viewCount ?? 0} views
          </Text>
          <Text style={{ color: colors.muted }}>
            <Ionicons name="copy-outline" /> {image.copyCount ?? 0} copies
          </Text>
        </View>
        {image.tags?.length ? (
          <View style={styles.chips}>
            {image.tags.map(({ tag }) => (
              <Pressable
                key={tag.id ?? tag.name}
                onPress={() =>
                  navigation.navigate("Search", { tag: tag.name.toLowerCase() })
                }
                style={[styles.chip, { backgroundColor: colors.primarySoft }]}
              >
                <Text style={{ color: colors.primary }}>#{tag.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Button
          colors={colors}
          title="View prompt"
          icon="sparkles-outline"
          onPress={() =>
            navigation.navigate("Prompt", { imageId, title: image.title })
          }
        />
        <Button
          colors={colors}
          title="Report image"
          icon="flag-outline"
          variant="secondary"
          onPress={() =>
            user
              ? navigation.navigate("Report", { imageId })
              : navigation.navigate("Login", { returnToImageId: imageId })
          }
        />
      </View>
      <FullScreenImageViewer
        visible={viewerVisible}
        imageUrl={image.imageUrl ?? image.thumbnailUrl}
        title={image.title}
        onClose={() => setViewerVisible(false)}
      />
    </ScrollView>
  );
}
