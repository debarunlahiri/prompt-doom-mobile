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
  const mobileAdsModule = await getMobileAdsModule();
  if (!mobileAdsModule) return false;

  try {
    await mobileAdsModule.default().initialize();
    return true;
  } catch {
    return false;
  }
}
