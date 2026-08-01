import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./config";
import { attachNetworkLogger } from "./services/networkLogger";
import { useAppStore } from "./store";
import {
  AdConfig,
  ApiErrorBody,
  GalleryImage,
  Pagination,
  Tokens,
  User,
} from "./types";

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 20_000 });
const refreshApi = axios.create({ baseURL: API_BASE_URL, timeout: 20_000 });
attachNetworkLogger(api);
attachNetworkLogger(refreshApi);
let refreshPromise: Promise<Tokens> | null = null;

api.interceptors.request.use((config) => {
  const token = useAppStore.getState().tokens?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const request = error.config as
    (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  const refreshToken = useAppStore.getState().tokens?.refreshToken;
  if (
    error.response?.status !== 401 ||
    !request ||
    request._retried ||
    !refreshToken ||
    request.url?.includes("/auth/refresh")
  ) {
    throw error;
  }
  request._retried = true;
  try {
    refreshPromise ??= refreshApi
      .post("/auth/refresh", { refreshToken })
      .then((response) => response.data.data.tokens as Tokens)
      .then(async (tokens) => {
        await useAppStore.getState().updateTokens(tokens);
        return tokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
    const tokens = await refreshPromise;
    request.headers.Authorization = `Bearer ${tokens.accessToken}`;
    return api(request);
  } catch (refreshError) {
    await useAppStore.getState().clearSession();
    throw refreshError;
  }
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    return (
      body?.error?.details?.[0]?.message ??
      body?.error?.message ??
      body?.message ??
      (error.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : error.message)
    );
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export const authApi = {
  register: async (body: { name: string; email: string; password: string }) => {
    const { data } = await api.post("/auth/register", body);
    return { user: data.data.user as User, tokens: data.data.tokens as Tokens };
  },
  login: async (body: { email: string; password: string }) => {
    const { data } = await api.post("/auth/login", body);
    return {
      user: data.data.account as User,
      tokens: data.data.tokens as Tokens,
    };
  },
  logout: (refreshToken: string) => api.post("/auth/logout", { refreshToken }),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
  revokeSessions: () => api.delete("/auth/sessions"),
};

export const userApi = {
  profile: async () => (await api.get("/users/me")).data.data.user as User,
  updateProfile: (body: { name?: string; avatarUrl?: string | null }) =>
    api.patch("/users/me", body),
  deleteAccount: (password: string) =>
    api.delete("/users/me", { data: { password } }),
  favorites: async (page = 1, limit = 20) => {
    const { data } = await api.get("/users/favorites", {
      params: { page, limit },
    });
    return {
      items: data.data.items.map((item: { image: GalleryImage }) => item.image),
      pagination: data.data.pagination as Pagination,
    };
  },
  history: async (page = 1, limit = 20) =>
    (await api.get("/users/history", { params: { page, limit } })).data.data,
};

export const imageApi = {
  list: async (params: {
    page?: number;
    limit?: number;
    q?: string;
    category?: string;
    tag?: string;
    model?: string;
  }) => {
    const { data } = await api.get("/images", { params });
    return {
      items: data.data.items as GalleryImage[],
      pagination: data.data.pagination as Pagination,
    };
  },
  detail: async (id: number) =>
    (await api.get(`/images/${id}`)).data.data.image as GalleryImage,
  prompt: async (id: number) =>
    (await api.get(`/images/${id}/prompt`)).data.data.prompt as {
      mainPrompt: string;
      negativePrompt?: string;
    },
  addFavorite: (id: number) => api.post(`/images/${id}/favorite`),
  removeFavorite: (id: number) => api.delete(`/images/${id}/favorite`),
  copy: (id: number) => api.post(`/images/${id}/copy`),
  share: (id: number, channel: string) =>
    api.post(`/images/${id}/share`, { channel }),
  report: (id: number, reason: string, details?: string) =>
    api.post(`/images/${id}/reports`, {
      reason,
      details: details || undefined,
    }),
};

export const adsApi = {
  config: async () =>
    (await api.get("/ads/config")).data.data.config as AdConfig,
  event: (body: {
    sessionId: string;
    eventType: string;
    provider: string;
    placement: string;
    metadata?: Record<string, string>;
  }) => api.post("/ads/events", body),
};
