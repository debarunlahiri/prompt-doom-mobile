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

export function PasswordFlowScreen({ reset = false }: { reset?: boolean }) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentUser = useAppStore((state) => state.user);
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [token, setToken] = useState(route.params?.token ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if ((!reset && !email) || (reset && (!token || password.length < 8)))
      return Alert.alert(
        "Check your details",
        reset
          ? "Enter the reset token and a password of at least 8 characters."
          : "Enter your email address.",
      );
    setBusy(true);
    try {
      const response = reset
        ? await authApi.resetPassword(token, password)
        : await authApi.forgotPassword(email.trim());
      if (!reset && response.data?.data?.resetToken) {
        Alert.alert(
          "Development reset token",
          "A development reset token was returned. Continue to set your new password.",
          [
            {
              text: "Continue",
              onPress: () =>
                navigation.navigate("ResetPassword", {
                  token: response.data.data.resetToken,
                }),
            },
          ],
        );
      } else {
        Alert.alert(
          "Done",
          reset
            ? "Password reset successfully. Sign in again."
            : "If the account exists, reset instructions have been generated.",
          [
            {
              text: "OK",
              onPress: () => reset && navigation.navigate("Login"),
            },
          ],
        );
      }
    } catch (e) {
      Alert.alert("Couldn’t continue", getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.form}>
        <Header
          title={reset ? "Reset password" : "Forgot password"}
          subtitle={
            reset
              ? "Set a strong new password."
              : "We’ll request reset instructions from the server."
          }
        />
        {reset ? (
          <>
            <Field
              colors={colors}
              label="Reset token"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
            />
            <Field
              colors={colors}
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        ) : (
          <Field
            colors={colors}
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
        <Button
          colors={colors}
          title={busy ? "Please wait…" : "Continue"}
          onPress={submit}
          disabled={busy}
        />
      </View>
    </SafeAreaView>
  );
}
