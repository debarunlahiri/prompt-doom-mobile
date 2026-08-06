# Prompt Doom Mobile

A React Native app for discovering AI artwork and viewing prompts through the supplied Prompt Doom v1 API.

## Configure

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_URL` to the complete v1 API URL. For a physical device, use the development computer's LAN IP instead of `localhost`, for example `http://192.168.0.158:8080/prompt-doom/api/v1`.
3. Android uses the configured Prompt Doom AdMob App ID and interstitial unit. `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID` can override the interstitial unit for a particular build.

The supplied Android banner, interstitial, rewarded interstitial, rewarded, and app-open unit IDs are centralized in `src/config.ts`. Only the interstitial has a product-approved placement: immediately before the authenticated prompt, subject to `/ads/config`. Other formats are not displayed until an appropriate user experience is defined. iOS continues to use Google's test App ID and test interstitial because no iOS identifiers were supplied.

No custom AI service is used. When the variable is absent, local development uses `http://192.168.0.158:8080/prompt-doom/api/v1`.

## Run

This project includes native Google Mobile Ads code, so use an Expo development build rather than Expo Go.

```sh
npm install
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

Validate code with:

```sh
npm run typecheck
npm run format:check
```

## API behavior

- Authentication tokens are kept in secure device storage and refresh tokens rotate automatically after a `401` response.
- Image list and details responses never expose prompt text. Prompt text is requested only from `/images/{id}/prompt`; the mobile interface permits guest access, so the deployed API must allow unauthenticated reads on this endpoint.
- Trending and latest collections are client-side views of the `/images` response because the v1 contract has no separate endpoints for them. Featured currently uses the highest-viewed returned items.
- Categories are discovered from image metadata because the v1 contract has no category-list endpoint.
- The notification center is local-only because no notification API was supplied.
- Change password uses the supplied forgot/reset-password workflow because no authenticated change-password endpoint was supplied.
- Replace the legal summaries with operator-approved Privacy Policy and Terms content before publishing.
