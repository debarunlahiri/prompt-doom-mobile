// Previous local API base URL: http://192.168.0.158:8080/prompt-doom/api/v1
export const API_BASE_URL = "https://promptdoom.com/api/v1";

export const PAGE_SIZE = 20;
export const APP_NAME = "Prompt Doom";
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";

export const ANDROID_AD_UNITS = {
  banner: "ca-app-pub-6583919661089892/6767673576",
  interstitial: "ca-app-pub-6583919661089892/8738516789",
  rewardedInterstitial: "ca-app-pub-6583919661089892/2636856873",
  rewarded: "ca-app-pub-6583919661089892/7697611861",
  appOpen: "ca-app-pub-6583919661089892/7506040170",
} as const;

export const LEGAL_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    body: "Prompt Doom stores your account details, favourites, prompt history, and interaction analytics to provide the service. Authentication tokens are stored securely on your device. You may request account deletion from your profile. Contact the Prompt Doom operator for privacy enquiries and the production policy URL.",
  },
  terms: {
    title: "Terms & Conditions",
    body: "Use Prompt Doom responsibly. Prompts and images may be subject to creator rights and platform rules. Do not redistribute content unlawfully, misuse the reporting tools, or attempt to disrupt the service. The production release should replace this summary with the operator-approved terms.",
  },
  about: {
    title: "About Prompt Doom",
    body: "Prompt Doom helps you discover AI-generated images, explore the prompts behind them, and save creative inspiration. The app uses the Prompt Doom version 1 API and does not generate images itself.",
  },
} as const;
