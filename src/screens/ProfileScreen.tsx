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
import { AmbientBackground } from "../components/AmbientBackground";
import { Header } from "../components/Header";
import { GoogleSignInPrompt } from "../components/GoogleSignInPrompt";
import { MenuRow } from "../components/MenuRow";
import { PromptCard } from "../components/PromptCard";
import { APP_NAME, LEGAL_CONTENT } from "../config";
import { useColors } from "../hooks/useColors";
import { maybeShowAd, recordDetailClick } from "../services/adService";
import { useAppStore } from "../store";
import { styles } from "../styles";
import { GalleryImage, User } from "../types";
import { usePagedImages } from "../usePagedImages";

export function ProfileScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);
  const setUser = useAppStore((state) => state.setUser);
  const clear = useAppStore((state) => state.clearSession);
  useFocusEffect(
    useCallback(() => {
      if (tokens)
        userApi
          .profile()
          .then(setUser)
          .catch(() => undefined);
    }, [tokens?.accessToken]),
  );
  const logout = () =>
    Alert.alert("Sign out?", "You can sign back in at any time.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          const refresh = useAppStore.getState().tokens?.refreshToken;
          if (refresh) await authApi.logout(refresh).catch(() => undefined);
          await clear();
        },
      },
    ]);
  if (!user)
    return (
      <SafeAreaView
        style={[styles.ambientScreen, { backgroundColor: colors.background }]}
      >
        <AmbientBackground />
        <Header title="Profile" subtitle="Sync your creative collection" />
        <GoogleSignInPrompt
          colors={colors}
          description="Continue with Google to save favourites, reveal prompts, and sync your history."
        />
      </SafeAreaView>
    );
  const rows = [
    {
      label: "Ad-free subscription",
      icon: "diamond-outline",
      screen: "Subscriptions",
    },
    { label: "Edit profile", icon: "create-outline", screen: "EditProfile" },
    { label: "Settings", icon: "settings-outline", screen: "Settings" },
  ] as const;
  return (
    <SafeAreaView
      style={[styles.ambientScreen, { backgroundColor: colors.background }]}
    >
      <AmbientBackground />
      <ScrollView>
        <Header title="Profile" />
        <View
          style={[
            styles.profileTop,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.avatarRing,
              {
                backgroundColor: colors.primarySoft,
                borderColor: `${colors.primary}35`,
              },
            ]}
          >
            {user.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View
                style={[styles.avatar, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.avatarText}>
                  {user.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.detailTitle, { color: colors.text }]}>
            {user.name}
          </Text>
          <Text style={{ color: colors.muted }}>{user.email}</Text>
          <View
            style={[
              styles.profileBadge,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: "800" }}>
              Creative profile
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.menu,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {rows.map((row) => (
            <MenuRow
              key={row.label}
              colors={colors}
              label={row.label}
              icon={row.icon}
              onPress={() => navigation.navigate(row.screen)}
            />
          ))}
          <MenuRow
            colors={colors}
            label="Sign out"
            icon="log-out-outline"
            danger
            onPress={logout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
