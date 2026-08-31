const publicEnv = (value: string | undefined, name: string) => {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`${name} is required.`);
  }
  return normalized;
};

export const API_BASE_URL = publicEnv(
  process.env.EXPO_PUBLIC_API_URL,
  "EXPO_PUBLIC_API_URL",
).replace(/\/$/, "");

export const PAGE_SIZE = 20;
export const APP_NAME = "Prompt Doom";
export const PRIVACY_URL = "https://promptdoom.com/app/privacy/";
export const TERMS_URL = "https://promptdoom.com/app/terms/";
export const ACCOUNT_DELETION_URL =
  "https://promptdoom.com/app/account-deletion/";
export const DATA_DELETION_URL = "https://promptdoom.com/app/data-deletion/";
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? "";

export const ANDROID_AD_UNITS = {
  banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID?.trim() ?? "",
  interstitial: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID?.trim() ?? "",
  rewardedInterstitial:
    process.env.EXPO_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_ID?.trim() ?? "",
  rewarded: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID?.trim() ?? "",
  appOpen: process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_ID?.trim() ?? "",
} as const;

export const LEGAL_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    body: `Effective August 30, 2026

Prompt Doom collects account information such as your name, email address, profile image, password hash, account status, and Google account identifier when you use Google Sign-In. Authentication tokens are stored using secure device storage.

We process favourites, viewed prompts and images, prompt-copy and sharing activity, content reports, search and browsing interactions, temporary ad-session events, and technical information needed to operate and secure the service.

For subscriptions, Prompt Doom and Razorpay or another displayed payment provider process plan, transaction, verification, renewal, cancellation, refund, and entitlement information. Prompt Doom does not store your complete card, bank-account, UPI credential, or payment authentication details.

Eligible users may see Google Mobile Ads. Google may process device information, advertising identifiers, IP address, and ad interactions under its own policies. Active ad-free subscribers do not receive Prompt Doom ad placements while their entitlement remains active.

We use information to authenticate accounts, synchronise favourites and history, deliver content, process subscriptions, determine ad eligibility, review reports, prevent abuse, secure the service, and meet legal obligations. We do not sell personal information. Information may be shared with Google, payment providers, hosting and security providers, or authorities when required to provide the service or comply with law.

We retain information only as needed for the service, security, fraud prevention, payments, disputes, tax, accounting, and legal compliance. You may request deletion of eligible personal data or your account and associated data through the Prompt Doom privacy centre. Verified deletion requests are scheduled for completion after the stated 14-day processing period, subject to limited lawful retention.

Prompt Doom is not directed to children under 13. The complete current Privacy Policy and deletion request forms are available at https://promptdoom.com/app/privacy/.`,
  },
  terms: {
    title: "Terms and Conditions",
    body: `Effective August 30, 2026

By creating an account or using Prompt Doom, you agree to these terms and the Privacy Policy. Prompt Doom lets you discover AI-generated images, view and copy associated prompts, save favourites, maintain history, share content, and report content. The mobile app displays existing content and does not itself generate images.

Keep your account information accurate and your credentials secure. Do not use Prompt Doom for unlawful, fraudulent, harmful, deceptive, or abusive activity. Do not bypass access controls, ad or subscription checks, disrupt the service, automate unauthorised access, submit malicious reports, access another user's account, or infringe another person's rights.

Images, prompts, names, and other materials may belong to Prompt Doom, creators, licensors, or other rights holders. Access does not transfer ownership. You are responsible for determining whether copying, sharing, adapting, publishing, or commercially using content is permitted.

The free service may display ads. Available subscription prices, billing periods, benefits, and currencies are shown before checkout. Subscriptions renew automatically until cancelled. Payment processing is provided by Razorpay or another displayed provider. Cancelling renewal normally takes effect after the current paid cycle, and access continues until then unless applicable law requires otherwise. Account deletion does not automatically cancel provider-managed renewal.

Payments are generally non-refundable after a paid period begins except where required by law or approved under the payment provider's rules. Prompt Doom may review duplicate, unauthorised, failed, or disputed charges.

The service and third-party features may change or become unavailable. Content is provided on an available basis, and you must review prompts and images before relying on or publishing them. Prompt Doom may restrict accounts used for abuse, fraud, security attacks, unlawful activity, or material violations of these terms.

The complete current Terms and Conditions are available at https://promptdoom.com/app/terms/.`,
  },
  about: {
    title: "About Prompt Doom",
    body: "Prompt Doom helps you discover AI-generated images, explore the prompts behind them, and save creative inspiration. The app uses the Prompt Doom version 1 API and does not generate images itself.",
  },
} as const;
