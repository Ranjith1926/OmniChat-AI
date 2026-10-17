import { TestIds } from 'react-native-google-mobile-ads';

/**
 * Real ad units, created per-placement in the AdMob console (Ad units tab) under the app
 * registered as ca-app-pub-8517213704157695~1334775653 — not to be confused with that App
 * ID, which only identifies the app itself and can't serve ads on its own. Each falls back
 * to Google's official test unit until a real one is set here, so ads always render instead
 * of silently failing to load.
 */
const PRODUCTION_AD_UNIT_IDS = {
  banner: null as string | null,
  interstitial: null as string | null,
  rewarded: null as string | null,
  rewardedInterstitial: null as string | null,
  appOpen: null as string | null,
  native: null as string | null,
};

function resolve(prod: string | null, testId: string): string {
  return __DEV__ ? testId : (prod ?? testId);
}

export const BANNER_AD_UNIT_ID = resolve(PRODUCTION_AD_UNIT_IDS.banner, TestIds.ADAPTIVE_BANNER);
export const INTERSTITIAL_AD_UNIT_ID = resolve(PRODUCTION_AD_UNIT_IDS.interstitial, TestIds.INTERSTITIAL);
export const REWARDED_AD_UNIT_ID = resolve(PRODUCTION_AD_UNIT_IDS.rewarded, TestIds.REWARDED);
export const REWARDED_INTERSTITIAL_AD_UNIT_ID = resolve(PRODUCTION_AD_UNIT_IDS.rewardedInterstitial, TestIds.REWARDED_INTERSTITIAL);
export const APP_OPEN_AD_UNIT_ID = resolve(PRODUCTION_AD_UNIT_IDS.appOpen, TestIds.APP_OPEN);
export const NATIVE_AD_UNIT_ID = resolve(PRODUCTION_AD_UNIT_IDS.native, TestIds.NATIVE);

/** How many free guest messages a completed rewarded-ad watch grants. */
export const REWARDED_MESSAGE_BONUS = 5;

/** Minimum time between interstitials, so starting several chats in a row isn't ad-spammed. */
export const INTERSTITIAL_COOLDOWN_MS = 60_000;
