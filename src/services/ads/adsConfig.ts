import { TestIds } from 'react-native-google-mobile-ads';

/**
 * Real banner ad unit, created per-placement in the AdMob console (Ad units tab) under
 * the app registered as ca-app-pub-8517213704157695~1334775653 — not to be confused with
 * that App ID, which only identifies the app itself and can't serve ads on its own.
 * Falls back to Google's official test unit until a real one is set here, so ads always
 * render instead of silently failing to load.
 */
const PRODUCTION_BANNER_AD_UNIT_ID: string | null = null;

export const BANNER_AD_UNIT_ID = __DEV__ ? TestIds.ADAPTIVE_BANNER : (PRODUCTION_BANNER_AD_UNIT_ID ?? TestIds.ADAPTIVE_BANNER);
