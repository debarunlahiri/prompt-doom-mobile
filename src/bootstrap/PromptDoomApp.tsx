import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { userApi } from "../api";
import { AppNavigator } from "../navigation/AppNavigator";
import { initializeMobileAds } from "../services/mobileAds";
import { useAppStore } from "../store";
import { styles } from "../styles";
import { lightColors } from "../theme";

export function PromptDoomApp() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);
  const tokens = useAppStore((state) => state.tokens);
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    void hydrate().catch(() => undefined);
    void initializeMobileAds().catch(() => false);
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && tokens) {
      userApi
        .profile()
        .then(setUser)
        .catch(() => undefined);
    }
  }, [hydrated, tokens?.accessToken, setUser]);

  if (!hydrated) {
    return (
      <View
        style={[styles.splash, { backgroundColor: lightColors.background }]}
      >
        <ActivityIndicator size="large" color={lightColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
