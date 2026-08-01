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
import { MenuRow } from "../components/MenuRow";
import { PromptCard } from "../components/PromptCard";
import { APP_NAME, LEGAL_CONTENT } from "../config";
import { useColors } from "../hooks/useColors";
import { maybeShowAd, recordDetailClick } from "../services/adService";
import { useAppStore } from "../store";
import { styles } from "../styles";
import { GalleryImage, User } from "../types";
import { usePagedImages } from "../usePagedImages";

export function PromptScreen() {
  const colors = useColors();
  const { imageId, title } = useRoute<any>().params;
  const [prompt, setPrompt] = useState<{
    mainPrompt: string;
    negativePrompt?: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const config = await adsApi.config().catch(() => ({
        enabled: false,
        showAfterClicks: 5,
        minIntervalSeconds: 120,
        maxAdsPerSession: 3,
      }));
      await maybeShowAd(config);
      setPrompt(await imageApi.prompt(imageId));
      setError("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [imageId]);
  useEffect(() => {
    void load();
  }, [load]);
  const copy = async (value: string) => {
    await Clipboard.setStringAsync(value);
    void imageApi.copy(imageId).catch(() => undefined);
    Alert.alert("Copied", "Prompt copied to clipboard.");
  };
  const share = async () => {
    if (!prompt) return;
    try {
      await Share.share({
        title,
        message: `${title}\n\nPrompt:\n${prompt.mainPrompt}${prompt.negativePrompt ? `\n\nNegative prompt:\n${prompt.negativePrompt}` : ""}`,
      });
      void imageApi.share(imageId, "system").catch(() => undefined);
    } catch {
      /* User cancelled. */
    }
  };
  if (loading || error || !prompt)
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
      contentContainerStyle={styles.promptPage}
    >
      <Header title={title} subtitle="Your creative blueprint" />
      <PromptCard
        colors={colors}
        title="Main prompt"
        text={prompt.mainPrompt}
        onCopy={() => copy(prompt.mainPrompt)}
      />
      {prompt.negativePrompt ? (
        <PromptCard
          colors={colors}
          title="Negative prompt"
          text={prompt.negativePrompt}
          onCopy={() => copy(prompt.negativePrompt!)}
        />
      ) : null}
      <Button
        colors={colors}
        title="Share prompts"
        icon="share-social-outline"
        onPress={share}
      />
    </ScrollView>
  );
}
