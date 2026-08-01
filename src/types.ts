export type ThemePreference = "system" | "light" | "dark";

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  status?: string;
  createdAt?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface Category {
  id?: number;
  name: string;
}

export interface GalleryImage {
  id: number;
  title: string;
  slug: string;
  imageUrl?: string;
  thumbnailUrl: string;
  aiModel?: string;
  publishedAt?: string;
  viewCount?: number;
  copyCount?: number;
  category?: Category;
  tags?: Array<{ tag: { id?: number; name: string } }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface ApiErrorBody {
  success: false;
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ message?: string }>;
  };
  message?: string;
}

export interface AdConfig {
  enabled: boolean;
  showAfterClicks: number;
  minIntervalSeconds: number;
  maxAdsPerSession: number;
}

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Login: { returnToImageId?: number } | undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  ImageDetail: { imageId: number };
  Prompt: { imageId: number; title: string };
  Search: { category?: string; tag?: string } | undefined;
  Categories: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  Settings: undefined;
  Legal: { page: "privacy" | "terms" | "about" };
  Report: { imageId: number };
};

export type MainTabParamList = {
  Home: undefined;
  Explore: { category?: string; tag?: string } | undefined;
  Favorites: undefined;
  History: undefined;
  Profile: undefined;
};
import type { NavigatorScreenParams } from "@react-navigation/native";
