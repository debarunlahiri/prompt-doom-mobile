import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { ThemePreference, Tokens, User } from "./types";

const TOKEN_KEY = "prompt-doom.tokens";
const SETTINGS_KEY = "prompt-doom.settings";

interface AppState {
  hydrated: boolean;
  user: User | null;
  tokens: Tokens | null;
  theme: ThemePreference;
  notificationsEnabled: boolean;
  favoriteIds: number[];
  hydrate: () => Promise<void>;
  setSession: (user: User, tokens: Tokens) => Promise<void>;
  updateTokens: (tokens: Tokens) => Promise<void>;
  setUser: (user: User | null) => void;
  clearSession: () => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setFavorite: (id: number, favorite: boolean) => void;
}

async function persistSettings(
  theme: ThemePreference,
  notificationsEnabled: boolean,
) {
  await AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ theme, notificationsEnabled }),
  );
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  user: null,
  tokens: null,
  theme: "system",
  notificationsEnabled: true,
  favoriteIds: [],
  hydrate: async () => {
    try {
      const [rawTokens, rawSettings] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);
      const settings = rawSettings ? JSON.parse(rawSettings) : {};
      set({
        tokens: rawTokens ? JSON.parse(rawTokens) : null,
        theme: settings.theme ?? "system",
        notificationsEnabled: settings.notificationsEnabled ?? true,
      });
    } finally {
      set({ hydrated: true });
    }
  },
  setSession: async (user, tokens) => {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
    set({ user, tokens });
  },
  updateTokens: async (tokens) => {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
    set({ tokens });
  },
  setUser: (user) => set({ user }),
  clearSession: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, tokens: null, favoriteIds: [] });
  },
  setTheme: async (theme) => {
    set({ theme });
    await persistSettings(theme, get().notificationsEnabled);
  },
  setNotificationsEnabled: async (notificationsEnabled) => {
    set({ notificationsEnabled });
    await persistSettings(get().theme, notificationsEnabled);
  },
  setFavorite: (id, favorite) =>
    set((state) => ({
      favoriteIds: favorite
        ? Array.from(new Set([...state.favoriteIds, id]))
        : state.favoriteIds.filter((item) => item !== id),
    })),
}));
