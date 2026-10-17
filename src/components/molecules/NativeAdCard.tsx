import { useEffect, useRef } from 'react';
import { Image, View } from 'react-native';
import { NativeAdView, NativeAsset, NativeAssetType, useNativeAd } from 'react-native-google-mobile-ads';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Text } from '@/components/atoms';
import { NATIVE_AD_UNIT_ID } from '@/services/ads/adsConfig';

export function NativeAdCard() {
  const theme = useAppTheme();
  const { status, nativeAd, retry } = useNativeAd({ adUnitId: NATIVE_AD_UNIT_ID });

  // The drawer (and this card) can mount before mobileAds().initialize() resolves, which
  // loses the very first load attempt — the hook's own docs say automatic loading never
  // retries itself, so give it exactly one more try once that failure settles.
  const hasRetried = useRef(false);
  useEffect(() => {
    if ((status === 'no-fill' || status === 'error') && !hasRetried.current) {
      hasRetried.current = true;
      retry();
    }
  }, [status, retry]);

  if (!nativeAd) return null;

  return (
    <NativeAdView nativeAd={nativeAd}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          padding: theme.spacing.sm,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          marginBottom: theme.spacing.sm,
        }}
      >
        {nativeAd.icon ? (
          <Image source={{ uri: nativeAd.icon.url }} style={{ width: 36, height: 36, borderRadius: theme.radius.sm }} />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={theme.colors.textTertiary}>
            Sponsored
          </Text>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text numberOfLines={1}>{nativeAd.headline}</Text>
          </NativeAsset>
        </View>
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <Text variant="caption" color={theme.colors.primary}>
            {nativeAd.callToAction}
          </Text>
        </NativeAsset>
      </View>
    </NativeAdView>
  );
}
