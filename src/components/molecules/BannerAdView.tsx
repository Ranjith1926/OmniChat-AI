import { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { BANNER_AD_UNIT_ID } from '@/services/ads/adsConfig';

export function BannerAdView() {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd unitId={BANNER_AD_UNIT_ID} size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER} onAdFailedToLoad={() => setFailed(true)} />
    </View>
  );
}
