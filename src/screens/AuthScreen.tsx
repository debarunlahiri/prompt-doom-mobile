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
import { PasswordStrength } from "../components/PasswordStrength";
import { MenuRow } from "../components/MenuRow";
import { PromptCard } from "../components/PromptCard";
import { APP_NAME, LEGAL_CONTENT } from "../config";
import { useColors } from "../hooks/useColors";
import { maybeShowAd, recordDetailClick } from "../services/adService";
import { getGoogleIdToken } from "../services/googleAuth";
import { useAppStore } from "../store";
import { styles } from "../styles";
import { GalleryImage, User } from "../types";
import { usePagedImages } from "../usePagedImages";

export function AuthScreen({ register = false }: { register?: boolean }) {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const setSession = useAppStore((state) => state.setSession);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    if (register && name.trim().length < 2)
      return setError("Enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setError("Enter a valid email address.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    setLoading(true);
    setError("");
    try {
      const session = register
        ? await authApi.register({
            name: name.trim(),
            email: email.trim(),
            password,
          })
        : await authApi.login({ email: email.trim(), password });
      await setSession(session.user, session.tokens);
      const targetId = route.params?.returnToImageId;
      navigation.reset({
        index: 0,
        routes: targetId
          ? [
              { name: "Main" },
              { name: "ImageDetail", params: { imageId: targetId } },
            ]
          : [{ name: "Main" }],
      });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const idToken = await getGoogleIdToken();
      if (!idToken) return;
      const session = await authApi.google(idToken);
      await setSession(session.user, session.tokens);
      const targetId = route.params?.returnToImageId;
      navigation.reset({
        index: 0,
        routes: targetId
          ? [
              { name: "Main" },
              { name: "ImageDetail", params: { imageId: targetId } },
            ]
          : [{ name: "Main" }],
      });
    } catch (googleError) {
      setError(getErrorMessage(googleError));
    } finally {
      setLoading(false);
    }
  };
  if (!register)
    return (
      <View
        style={[styles.authSheetOverlay, { backgroundColor: colors.overlay }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sign in"
          onPress={() => navigation.goBack()}
          style={styles.authSheetBackdrop}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          pointerEvents="box-none"
          style={styles.authSheetKeyboard}
        >
          <SafeAreaView
            edges={["bottom"]}
            style={[styles.authSheet, { backgroundColor: colors.surface }]}
          >
            <View
              style={[
                styles.authSheetHandle,
                { backgroundColor: colors.border },
              ]}
            />
            <View style={styles.authSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.authSheetTitle, { color: colors.text }]}>
                  Welcome back
                </Text>
                <Text
                  style={[styles.authSheetSubtitle, { color: colors.muted }]}
                >
                  Sign in to sync your prompts and favourites.
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => navigation.goBack()}
                style={[
                  styles.iconButton,
                  { backgroundColor: colors.surfaceAlt },
                ]}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {Platform.OS === "android" && (
              <Button
                colors={colors}
                title={loading ? "Connecting…" : "Continue with Google"}
                icon="logo-google"
                variant="secondary"
                onPress={signInWithGoogle}
                disabled={loading}
              />
            )}
            {error ? (
              <Text style={{ color: colors.danger }}>{error}</Text>
            ) : null}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    );
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.auth}
      >
        <Image
          source={require("../../assets/prompt-doom-logo.png")}
          style={styles.logoImage}
          contentFit="contain"
          accessibilityLabel="Prompt Doom logo"
        />
        <Text style={[styles.authTitle, { color: colors.text }]}>
          {register ? "Create your account" : "Welcome back"}
        </Text>
        <Text style={[styles.authSubtitle, { color: colors.muted }]}>
          {register
            ? "Save prompts and build your inspiration library."
            : "Sign in to unlock prompts and favourites."}
        </Text>
        {register && (
          <Field
            colors={colors}
            label="Name"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        <Field
          colors={colors}
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          colors={colors}
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {register && <PasswordStrength password={password} colors={colors} />}
        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        <Button
          colors={colors}
          title={
            loading ? "Please wait…" : register ? "Create account" : "Sign in"
          }
          icon={register ? "person-add-outline" : "log-in-outline"}
          onPress={submit}
          disabled={loading}
        />
        {Platform.OS === "android" && (
          <Button
            colors={colors}
            title="Continue with Google"
            icon="logo-google"
            variant="secondary"
            onPress={signInWithGoogle}
            disabled={loading}
          />
        )}
        {!register && (
          <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={[styles.link, { color: colors.primary }]}>
              Forgot password?
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => navigation.replace(register ? "Login" : "Register")}
        >
          <Text style={[styles.link, { color: colors.primary }]}>
            {register
              ? "Already have an account? Sign in"
              : "New to Prompt Doom? Create an account"}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
