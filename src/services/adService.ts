import { adsApi } from "../api";
import { ANDROID_AD_UNITS } from "../config";
import { AdConfig } from "../types";
import { getMobileAdsModule } from "./mobileAds";
import { Platform } from "react-native";

const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
let detailClicks = 0;
let adsShown = 0;
let lastAdAt = 0;
let imageOpenInProgress = false;
let promptOpenInProgress = false;

export function recordDetailClick() {
  detailClicks += 1;
}

export async function openImageWithInterstitial(
  openImage: () => void,
): Promise<void> {
  if (imageOpenInProgress) return;

  imageOpenInProgress = true;
  recordDetailClick();

  try {
    const config = await adsApi.config().catch(() => ({
      enabled: false,
      showAfterClicks: 5,
      minIntervalSeconds: 120,
      maxAdsPerSession: 3,
    }));
    await maybeShowAd(config).catch(() => undefined);
  } finally {
    imageOpenInProgress = false;
    openImage();
  }
}

export async function openPromptWithInterstitial(
  openPrompt: () => void,
): Promise<void> {
  if (promptOpenInProgress) return;

  promptOpenInProgress = true;
  recordDetailClick();

  try {
    const config = await adsApi.config().catch(() => ({
      enabled: false,
      showAfterClicks: 5,
      minIntervalSeconds: 120,
      maxAdsPerSession: 3,
    }));
    await maybeShowAd(config, "view-prompt").catch(() => undefined);
  } finally {
    promptOpenInProgress = false;
    openPrompt();
  }
}

export async function maybeShowAd(
  config: AdConfig,
  placement = "image-detail",
): Promise<void> {
  const now = Date.now();
  const eligible =
    config.enabled &&
    detailClicks >= config.showAfterClicks &&
    adsShown < config.maxAdsPerSession &&
    now - lastAdAt >= config.minIntervalSeconds * 1000;
  if (!eligible) {
    void adsApi
      .event({
        sessionId,
        eventType: "skipped",
        provider: "admob",
        placement,
      })
      .catch(() => undefined);
    return;
  }
  const mobileAdsModule = await getMobileAdsModule();
  if (!mobileAdsModule) {
    void adsApi
      .event({
        sessionId,
        eventType: "skipped",
        provider: "admob",
        placement,
        metadata: { reason: "native-module-unavailable" },
      })
      .catch(() => undefined);
    return;
  }
  const { AdEventType, InterstitialAd, TestIds } = mobileAdsModule;
  const configuredUnitId =
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID?.trim();
  const hasValidConfiguredUnitId =
    configuredUnitId !== undefined &&
    /^ca-app-pub-\d{16}\/\d{10}$/.test(configuredUnitId);
  const productionUnitId = hasValidConfiguredUnitId
    ? configuredUnitId
    : Platform.OS === "android"
      ? ANDROID_AD_UNITS.interstitial
      : TestIds.INTERSTITIAL;
  const unitId = __DEV__ ? TestIds.INTERSTITIAL : productionUnitId;

  if (typeof InterstitialAd?.createForAdRequest !== "function") {
    void adsApi
      .event({
        sessionId,
        eventType: "failed",
        provider: "admob",
        placement,
        metadata: { reason: "interstitial-api-unavailable" },
      })
      .catch(() => undefined);
    return;
  }

  await new Promise<void>((resolve) => {
    let ad: ReturnType<typeof InterstitialAd.createForAdRequest>;
    try {
      ad = InterstitialAd.createForAdRequest(unitId);
    } catch (error) {
      void adsApi
        .event({
          sessionId,
          eventType: "failed",
          provider: "admob",
          placement,
          metadata: {
            reason: "interstitial-create-failed",
            message: error instanceof Error ? error.message : String(error),
          },
        })
        .catch(() => undefined);
      resolve();
      return;
    }
    if (
      typeof ad.addAdEventListener !== "function" ||
      typeof ad.load !== "function" ||
      typeof ad.show !== "function"
    ) {
      void adsApi
        .event({
          sessionId,
          eventType: "failed",
          provider: "admob",
          placement,
          metadata: {
            reason: "interstitial-instance-incomplete",
            hasListener: typeof ad.addAdEventListener === "function",
            hasLoad: typeof ad.load === "function",
            hasShow: typeof ad.show === "function",
          },
        })
        .catch(() => undefined);
      resolve();
      return;
    }
    let finished = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let unsubLoaded: (() => void) | undefined;
    let unsubClosed: (() => void) | undefined;
    let unsubError: (() => void) | undefined;
    const done = () => {
      if (finished) return;
      finished = true;
      if (timeout) clearTimeout(timeout);
      if (typeof unsubLoaded === "function") unsubLoaded();
      if (typeof unsubClosed === "function") unsubClosed();
      if (typeof unsubError === "function") unsubError();
      resolve();
    };
    unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      adsShown += 1;
      lastAdAt = Date.now();
      detailClicks = 0;
      void adsApi
        .event({
          sessionId,
          eventType: "displayed",
          provider: "admob",
          placement,
        })
        .catch(() => undefined);
      try {
        void Promise.resolve(ad.show()).catch(done);
      } catch {
        done();
      }
    });
    unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      void adsApi
        .event({
          sessionId,
          eventType: "closed",
          provider: "admob",
          placement,
        })
        .catch(() => undefined);
      done();
    });
    unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      void adsApi
        .event({
          sessionId,
          eventType: "failed",
          provider: "admob",
          placement,
        })
        .catch(() => undefined);
      done();
    });
    try {
      ad.load();
      timeout = setTimeout(done, 9000);
    } catch {
      done();
    }
  });
}
