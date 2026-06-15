import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/GameColors';

// Only import AdMob on Android — the module is not available on iOS/web
let NativeAdView: React.ComponentType<any> | null = null;
let NativeMediaView: React.ComponentType<any> | null = null;
let NativeAsset: React.ComponentType<any> | null = null;
let NativeAd: any = null;
let TestIds: any = null;

if (Platform.OS === 'android') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admob = require('react-native-google-mobile-ads');
    NativeAdView = admob.NativeAdView;
    NativeMediaView = admob.NativeMediaView;
    NativeAsset = admob.NativeAsset;
    NativeAd = admob.NativeAd;
    TestIds = admob.TestIds;
  } catch (_e) {
    // Module not available in this environment (e.g. Expo Go)
  }
}

const adUnitId = __DEV__
  ? (TestIds?.NATIVE ?? 'ca-app-pub-3940256099942544/2247696110')
  : 'ca-app-pub-9075835145391390/6680457981';

export default function NativeAdCard() {
  console.log('[NativeAdCard] Rendering, platform:', Platform.OS);

  const [nativeAd, setNativeAd] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android' || !NativeAd) {
      return;
    }

    console.log('[NativeAdCard] Loading native ad, adUnitId:', adUnitId);

    let ad: any = null;

    NativeAd.createForAdRequest(adUnitId)
      .then((loadedAd: any) => {
        console.log('[NativeAdCard] Native ad loaded successfully');
        ad = loadedAd;
        setNativeAd(loadedAd);
      })
      .catch((err: any) => {
        console.log('[NativeAdCard] Native ad failed to load:', err?.message ?? err);
        setError(true);
      });

    return () => {
      if (ad) {
        try {
          ad.destroy?.();
        } catch (_e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Guard: only render on Android
  if (Platform.OS !== 'android') {
    return null;
  }

  // Not yet loaded or errored
  if (!nativeAd || error || !NativeAdView || !NativeMediaView || !NativeAsset) {
    return null;
  }

  return (
    <NativeAdView nativeAd={nativeAd} style={styles.card}>
      {/* Ad badge */}
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>Ad</Text>
      </View>

      {/* Media */}
      <NativeMediaView style={styles.media} />

      {/* Content */}
      <View style={styles.content}>
        {/* Advertiser */}
        <NativeAsset assetName="advertiser">
          <Text style={styles.advertiser} numberOfLines={1} />
        </NativeAsset>

        {/* Headline */}
        <NativeAsset assetName="headline">
          <Text style={styles.headline} numberOfLines={2} />
        </NativeAsset>

        {/* Body */}
        <NativeAsset assetName="body">
          <Text style={styles.body} numberOfLines={3} />
        </NativeAsset>

        {/* Call to action */}
        <NativeAsset assetName="callToAction">
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText} />
          </View>
        </NativeAsset>
      </View>
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  adBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.textTertiary,
    backgroundColor: COLORS.background,
  },
  adBadgeText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
  },
  media: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 14,
    gap: 6,
  },
  advertiser: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: COLORS.textTertiary,
    letterSpacing: 0.3,
  },
  headline: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 15,
    color: COLORS.text,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  ctaButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  ctaText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 13,
    color: COLORS.background,
    letterSpacing: 0.3,
  },
});
