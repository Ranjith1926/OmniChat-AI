import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';

import { INTERSTITIAL_AD_UNIT_ID, INTERSTITIAL_COOLDOWN_MS } from './adsConfig';

const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID);
let isLoaded = false;
let lastShownAt = 0;

interstitial.addAdEventListener(AdEventType.LOADED, () => {
  isLoaded = true;
});
interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  isLoaded = false;
  interstitial.load();
});
interstitial.load();

/**
 * Shows the preloaded interstitial if one's ready and the cooldown has elapsed; no-ops
 * otherwise. Fire-and-forget by design — callers navigate immediately regardless, so a
 * slow or failed ad load never blocks the action that triggered it.
 */
export function showInterstitialIfReady(): void {
  if (!isLoaded) return;
  if (Date.now() - lastShownAt < INTERSTITIAL_COOLDOWN_MS) return;
  lastShownAt = Date.now();
  interstitial.show().catch(() => {});
}
