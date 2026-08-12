import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { authApi, getErrorMessage } from "../api";
import { getGoogleIdToken } from "../services/googleAuth";
import { useAppStore } from "../store";
import { AppColors } from "../theme";
import { styles } from "../styles";

export function GoogleSignInPrompt({
  colors,
  title = "Your space awaits",
  description,
}: {
  colors: AppColors;
  title?: string;
  description: string;
}) {
  const setSession = useAppStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    if (loading) return;

    setLoading(true);
    setError("");
    try {
      const idToken = await getGoogleIdToken();
      if (!idToken) return;
      const session = await authApi.google(idToken);
      await setSession(session.user, session.tokens);
    } catch (signInError) {
      setError(getErrorMessage(signInError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.profileGuest}>
      <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name="person-outline" size={40} color={colors.primary} />
      </View>
      <Text style={[styles.detailTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.googlePromptDescription, { color: colors.muted }]}>
        {description}
      </Text>
      {Platform.OS === "android" && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          disabled={loading}
          onPress={() => void signInWithGoogle()}
          style={({ pressed }) => [
            styles.googleSignInButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed || loading ? 0.78 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="logo-google" size={21} color="#4285F4" />
          )}
          <Text style={[styles.googleSignInText, { color: colors.text }]}>
            {loading ? "Connecting…" : "Continue with Google"}
          </Text>
        </Pressable>
      )}
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </View>
  );
}
