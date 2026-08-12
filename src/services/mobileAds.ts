import Constants, { ExecutionEnvironment } from "expo-constants";

type MobileAdsModule = typeof import("react-native-google-mobile-ads");

let modulePromise: Promise<MobileAdsModule | null> | null = null;

/**
 * Expo Go does not bundle Google Mobile Ads. Loading the module lazily keeps
 * the rest of the application usable there while retaining ads in native
 * development and production builds.
 */
export function getMobileAdsModule(): Promise<MobileAdsModule | null> {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return Promise.resolve(null);
  }

  modulePromise ??= import("react-native-google-mobile-ads").catch(() => null);
  return modulePromise;
}

export async function initializeMobileAds(): Promise<boolean> {
  try {
    const mobileAdsModule = await getMobileAdsModule();
    const mobileAds = mobileAdsModule?.default;
    if (typeof mobileAds !== "function") return false;

    const adsInstance = mobileAds();
    if (typeof adsInstance?.initialize !== "function") return false;

    await adsInstance.initialize();
    return true;
  } catch {
    return false;
  }
}
