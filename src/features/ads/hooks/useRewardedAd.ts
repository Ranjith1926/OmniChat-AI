import { useCallback, useEffect, useRef, useState } from 'react';
import { AdEventType, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

import { REWARDED_AD_UNIT_ID } from '@/services/ads/adsConfig';

export function useRewardedAd(onEarnedReward: () => void) {
  const onEarnedRewardRef = useRef(onEarnedReward);
  const adRef = useRef<RewardedAd | undefined>(undefined);
  if (adRef.current == null) {
    adRef.current = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);
  }

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    onEarnedRewardRef.current = onEarnedReward;
  });

  useEffect(() => {
    const ad = adRef.current!;
    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => setLoaded(true));
    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => onEarnedRewardRef.current());
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      ad.load();
    });
    ad.load();

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
    };
  }, []);

  const show = useCallback(() => {
    adRef.current?.show().catch(() => {});
  }, []);

  return { loaded, show };
}
