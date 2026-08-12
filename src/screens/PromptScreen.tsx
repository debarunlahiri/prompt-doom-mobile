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
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi, getErrorMessage, imageApi, userApi, adsApi } from "../api";
import { Field, ImageCard, ImageGrid, ScreenState } from "../components";
import { Header } from "../components/Header";
import { MenuRow } from "../components/MenuRow";
import { PromptCard } from "../components/PromptCard";
import { APP_NAME, LEGAL_CONTENT } from "../config";
import { useColors } from "../hooks/useColors";
import { useAppStore } from "../store";
import { styles } from "../styles";
import { GalleryImage, User } from "../types";
import { usePagedImages } from "../usePagedImages";

export function PromptScreen() {
  const colors = useColors();
  const { imageId, title } = useRoute<any>().params;
  const [prompt, setPrompt] = useState<{
    mainPrompt: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
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
    try {
      await imageApi.copy(imageId);
    } catch (copyError) {
      console.warn("Prompt copy tracking failed", copyError);
    }
    Alert.alert("Copied", "Prompt copied to clipboard.");
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
    </ScrollView>
  );
}
