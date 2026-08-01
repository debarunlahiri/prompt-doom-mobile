import { adsApi } from "../api";
import { ANDROID_AD_UNITS } from "../config";
import { AdConfig } from "../types";
import { getMobileAdsModule } from "./mobileAds";
import { Platform } from "react-native";

const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
let detailClicks = 0;
let adsShown = 0;
let lastAdAt = 0;

export function recordDetailClick() {
  detailClicks += 1;
}

export async function maybeShowAd(config: AdConfig): Promise<void> {
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
        placement: "image-detail",
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
        placement: "image-detail",
        metadata: { reason: "native-module-unavailable" },
      })
      .catch(() => undefined);
    return;
  }
  const { AdEventType, InterstitialAd, TestIds } = mobileAdsModule;
  const unitId =
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ||
    (Platform.OS === "android"
      ? ANDROID_AD_UNITS.interstitial
      : TestIds.INTERSTITIAL);
  await new Promise<void>((resolve) => {
    const ad = InterstitialAd.createForAdRequest(unitId);
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      unsubLoaded();
      unsubClosed();
      unsubError();
      resolve();
    };
    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      adsShown += 1;
      lastAdAt = Date.now();
      detailClicks = 0;
      void adsApi
        .event({
          sessionId,
          eventType: "displayed",
          provider: "admob",
          placement: "image-detail",
        })
        .catch(() => undefined);
      ad.show().catch(done);
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      void adsApi
        .event({
          sessionId,
          eventType: "closed",
          provider: "admob",
          placement: "image-detail",
        })
        .catch(() => undefined);
      done();
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      void adsApi
        .event({
          sessionId,
          eventType: "failed",
          provider: "admob",
          placement: "image-detail",
        })
        .catch(() => undefined);
      done();
    });
    ad.load();
    setTimeout(done, 9000);
  });
}
