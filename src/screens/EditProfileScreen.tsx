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

export function EditProfileScreen() {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const user = useAppStore((state) => state.user)!;
  const setUser = useAppStore((state) => state.setUser);
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (name.trim().length < 2)
      return Alert.alert("Invalid name", "Enter at least two characters.");
    setBusy(true);
    try {
      await userApi.updateProfile({
        name: name.trim(),
      });
      const updated: User = {
        ...user,
        name: name.trim(),
      };
      setUser(updated);
      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: navigation.goBack },
      ]);
    } catch (e) {
      Alert.alert("Couldn’t save", getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.form}>
        <Field
          colors={colors}
          label="Name"
          value={name}
          onChangeText={setName}
        />
        <Button
          colors={colors}
          title={busy ? "Saving…" : "Save changes"}
          onPress={save}
          disabled={busy}
        />
      </View>
    </SafeAreaView>
  );
}
