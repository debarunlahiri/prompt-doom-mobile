import Constants, { ExecutionEnvironment } from "expo-constants";
import { GOOGLE_WEB_CLIENT_ID } from "../config";

type GoogleSignInModule =
  typeof import("@react-native-google-signin/google-signin");

export async function getGoogleIdToken(): Promise<string | null> {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error("Google sign-in requires a native development build.");
  }
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error("Google sign-in is not configured.");
  }

  const { GoogleSignin, isSuccessResponse } =
    (await import("@react-native-google-signin/google-signin")) as GoogleSignInModule;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) return null;
  if (!response.data.idToken) {
    throw new Error("Google did not return an identity token.");
  }
  return response.data.idToken;
}
