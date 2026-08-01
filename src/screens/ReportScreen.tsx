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

export function ReportScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { imageId } = useRoute<any>().params;
  const reasons = [
    "sexual",
    "violent",
    "hateful",
    "copyright",
    "misleading",
    "other",
  ];
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!reason)
      return Alert.alert(
        "Choose a reason",
        "Select why you’re reporting this image.",
      );
    setBusy(true);
    try {
      await imageApi.report(imageId, reason, details.trim());
      Alert.alert(
        "Report submitted",
        "Thank you for helping keep Prompt Doom safe.",
        [{ text: "Done", onPress: navigation.goBack }],
      );
    } catch (e) {
      Alert.alert("Couldn’t submit report", getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          What’s wrong with this image?
        </Text>
        <View style={styles.chips}>
          {reasons.map((item) => (
            <Pressable
              key={item}
              onPress={() => setReason(item)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    reason === item ? colors.primary : colors.surface,
                },
              ]}
            >
              <Text
                style={{
                  color: reason === item ? "#FFF" : colors.text,
                  textTransform: "capitalize",
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <Field
          colors={colors}
          label="Additional details (optional)"
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Button
          colors={colors}
          title={busy ? "Submitting…" : "Submit report"}
          onPress={submit}
          disabled={busy}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
