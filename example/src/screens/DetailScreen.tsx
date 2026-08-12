/**
 * DetailScreen
 *
 * An immersive hero screen. The photograph and the title are the two shared
 * elements — neither they nor any ancestor may carry an entrance animation, or
 * the coordinator would measure a frame that is still moving. Everything below
 * the fold is free to animate in.
 */

import { useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SharedElement } from 'react-native-shared-transition';

import { PressableScale } from '../components/PressableScale';
import { Scrim } from '../components/Scrim';
import { getDestination } from '../data/destinations';
import { useTheme } from '../theme';
import { useTransitionVariant } from '../transition/variants';
import type { DetailScreenProps } from '../navigation/types';

export function DetailScreen({ route, navigation }: DetailScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { variant } = useTransitionVariant();

  const destination = getDestination(route.params.id);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  if (!destination) {
    // Defensive: a bad deep link should not crash the demo.
    return (
      <View
        style={[
          styles.screen,
          styles.centered,
          { backgroundColor: theme.color.canvas },
        ]}
      >
        <Text style={[theme.type.body, { color: theme.color.textSecondary }]}>
          That frame is no longer in the archive.
        </Text>
      </View>
    );
  }

  const heroHeight = Math.round(screenHeight * 0.56);

  return (
    <View style={[styles.screen, { backgroundColor: theme.color.canvas }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.space.huge,
        }}
      >
        {/* Hero — no entrance animation anywhere in this subtree. */}
        <View style={[styles.hero, { height: heroHeight }]}>
          <SharedElement
            id={`dest.${destination.id}.photo`}
            style={StyleSheet.absoluteFill}
          >
            <Image
              source={destination.photo}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </SharedElement>

          <Scrim
            color={theme.color.scrim}
            intensity={0.94}
            style={styles.heroScrim}
          />

          <View
            style={[
              styles.heroContent,
              {
                paddingBottom: theme.space.xxl,
                paddingHorizontal: theme.space.xxl,
              },
            ]}
          >
            <View style={styles.metaRow}>
              <View
                style={[styles.swatch, { backgroundColor: destination.swatch }]}
              />
              <Text
                style={[
                  theme.type.overline,
                  styles.overline,
                  { color: theme.color.textOnImage },
                ]}
              >
                {destination.region.toUpperCase()} ·{' '}
                {destination.hour.toUpperCase()}
              </Text>
            </View>

            <SharedElement
              id={`dest.${destination.id}.title`}
              config={{ contentScale: 'transform', crossFade: true }}
            >
              <Text
                style={[theme.type.display, { color: theme.color.textOnImage }]}
              >
                {destination.title}
              </Text>
            </SharedElement>
          </View>
        </View>

        {/* Body */}
        <View style={[styles.body, { paddingHorizontal: theme.space.xxl }]}>
          <Animated.Text
            entering={FadeInDown.delay(90).springify().damping(18)}
            style={[
              theme.type.title3,
              styles.lead,
              { color: theme.color.textPrimary },
            ]}
          >
            {destination.tagline}
          </Animated.Text>

          {destination.body.map((paragraph, i) => (
            <Animated.Text
              key={i}
              entering={FadeInDown.delay(150 + i * 70)
                .springify()
                .damping(18)}
              style={[
                theme.type.body,
                styles.paragraph,
                { color: theme.color.textSecondary },
              ]}
            >
              {paragraph}
            </Animated.Text>
          ))}

          {/* What just happened — makes the demo self-explanatory. */}
          <Animated.View
            entering={FadeInDown.delay(320).springify().damping(18)}
            style={[
              styles.configCard,
              {
                backgroundColor: theme.color.surface,
                borderColor: theme.color.border,
                borderRadius: theme.radius.md,
                padding: theme.space.lg,
              },
            ]}
          >
            <Text style={[theme.type.overline, { color: theme.color.accent }]}>
              TRANSITION USED
            </Text>
            <Text
              style={[
                theme.type.title3,
                styles.configTitle,
                { color: theme.color.textPrimary },
              ]}
            >
              {variant.label}
            </Text>
            <Text
              style={[theme.type.caption, { color: theme.color.textTertiary }]}
            >
              {variant.hint}
            </Text>
            <Text
              style={[
                theme.type.caption,
                styles.configCode,
                {
                  color: theme.color.textSecondary,
                  backgroundColor: theme.color.surfaceRaised,
                  borderRadius: theme.radius.xs,
                },
              ]}
            >
              {JSON.stringify(variant.config, null, 2)}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Back affordance — outside the scroll view, above the safe area. */}
      <View
        style={[
          styles.backLayer,
          { top: insets.top + theme.space.sm, left: theme.space.lg },
        ]}
        pointerEvents="box-none"
      >
        <PressableScale
          onPress={handleBack}
          activeScale={0.9}
          accessibilityLabel="Back to the gallery"
          style={[
            styles.backButton,
            {
              backgroundColor: theme.color.controlOnImage,
              borderColor: theme.color.borderOnImage,
              borderRadius: theme.radius.full,
            },
          ]}
        >
          <Text style={[styles.backGlyph, { color: theme.color.textOnImage }]}>
            ‹
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },

  hero: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroContent: {},
  // Only wash the lower half so the photograph reads at the top.
  heroScrim: {
    top: '42%',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  overline: { opacity: 0.9 },

  body: {
    paddingTop: 28,
  },
  lead: {
    marginBottom: 18,
  },
  paragraph: {
    marginBottom: 16,
  },

  configCard: {
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  configTitle: {
    marginTop: 6,
    marginBottom: 4,
  },
  configCode: {
    marginTop: 14,
    padding: 12,
    fontFamily: 'Menlo',
    lineHeight: 18,
  },

  backLayer: {
    position: 'absolute',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  backGlyph: {
    fontSize: 30,
    lineHeight: 34,
    marginTop: -4,
    fontWeight: '400',
  },
});

export default DetailScreen;
