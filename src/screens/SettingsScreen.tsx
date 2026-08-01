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

export function SettingsScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const notifications = useAppStore((state) => state.notificationsEnabled);
  const setNotifications = useAppStore(
    (state) => state.setNotificationsEnabled,
  );
  const options = ["system", "light", "dark"] as const;
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Appearance
        </Text>
        <View style={styles.segment}>
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => setTheme(option)}
              style={[
                styles.segmentItem,
                {
                  backgroundColor:
                    theme === option ? colors.primary : colors.surface,
                },
              ]}
            >
              <Ionicons
                name={
                  option === "system"
                    ? "phone-portrait-outline"
                    : option === "light"
                      ? "sunny-outline"
                      : "moon-outline"
                }
                size={18}
                color={theme === option ? "#FFF" : colors.text}
              />
              <Text
                style={{
                  color: theme === option ? "#FFF" : colors.text,
                  textTransform: "capitalize",
                  fontWeight: "700",
                }}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              Notifications
            </Text>
            <Text style={{ color: colors.muted }}>
              Show updates in the notification center
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Information
        </Text>
        {(["privacy", "terms", "about"] as const).map((page) => (
          <MenuRow
            key={page}
            colors={colors}
            label={LEGAL_CONTENT[page].title}
            icon={
              page === "privacy"
                ? "shield-checkmark-outline"
                : page === "terms"
                  ? "document-text-outline"
                  : "information-circle-outline"
            }
            onPress={() => navigation.navigate("Legal", { page })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
