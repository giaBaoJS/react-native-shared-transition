/**
 * GalleryScreen
 *
 * The gallery: one full-bleed hero card followed by a two-column masonry grid.
 * Every card carries two shared elements — the photograph and its title — so a
 * tap flies both to the detail screen at once.
 */

import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SharedElement } from 'react-native-shared-transition';

import { PressableScale } from '../components/PressableScale';
import { Scrim } from '../components/Scrim';
import { SegmentedControl } from '../components/SegmentedControl';
import { destinations } from '../data/destinations';
import { useTheme } from '../theme';
import { VARIANTS, useTransitionVariant } from '../transition/variants';
import type { VariantId } from '../transition/variants';
import type { Destination } from '../types';
import type { GalleryScreenProps } from '../navigation/types';

const COLUMN_GAP = 12;
const GUTTER = 24;

/** Masonry heights, cycled across the grid to break the rhythm up. */
const GRID_HEIGHTS = [232, 188, 204, 248, 236, 192, 212, 228];

// The gallery is a module constant, so the split and the column balancing are
// computed once rather than on every render.
const HERO = destinations[0];
const GRID_ITEMS = destinations.slice(1);

const COLUMNS = (() => {
  const left: Array<{
    destination: Destination;
    height: number;
    index: number;
  }> = [];
  const right: typeof left = [];
  let leftHeight = 0;
  let rightHeight = 0;

  GRID_ITEMS.forEach((destination, i) => {
    const height = GRID_HEIGHTS[i % GRID_HEIGHTS.length]!;
    // Always feed whichever column is currently shorter.
    if (leftHeight <= rightHeight) {
      left.push({ destination, height, index: i });
      leftHeight += height + COLUMN_GAP;
    } else {
      right.push({ destination, height, index: i });
      rightHeight += height + COLUMN_GAP;
    }
  });

  return { left, right };
})();

const SEGMENT_OPTIONS = VARIANTS.map((v) => ({ id: v.id, label: v.label }));

// =============================================================================
// Cards
// =============================================================================

interface CardProps {
  destination: Destination;
  index: number;
  onPress: (destination: Destination) => void;
}

function HeroCard({ destination, index, onPress }: CardProps) {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * theme.motion.stagger)
        .springify()
        .damping(theme.motion.entrance.damping)
        .stiffness(theme.motion.entrance.stiffness)}
      style={[styles.heroWrapper, theme.elevation.card]}
    >
      <PressableScale
        onPress={() => onPress(destination)}
        activeScale={0.985}
        accessibilityLabel={destination.title}
        accessibilityHint={`Opens ${destination.title}`}
        style={styles.fill}
      >
        <View
          style={[styles.heroCard, { borderRadius: theme.radius.xl }]}
          // The overlay clone is drawn by the library; this view only frames it.
        >
          {/* The wrapper must be sized — it is what gets measured, and the
              image inside it is absolutely positioned. */}
          <SharedElement
            id={`dest.${destination.id}.photo`}
            style={StyleSheet.absoluteFill}
          >
            <Image
              source={destination.photo}
              style={[styles.heroImage, { borderRadius: theme.radius.xl }]}
              resizeMode="cover"
            />
          </SharedElement>

          <Scrim
            color={theme.color.scrim}
            intensity={0.9}
            style={styles.heroScrim}
          />

          <View style={styles.heroContent}>
            <View style={styles.metaRow}>
              <View
                style={[styles.swatch, { backgroundColor: destination.swatch }]}
              />
              <Text
                style={[
                  theme.type.overline,
                  styles.overlineOnImage,
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
                style={[theme.type.title1, { color: theme.color.textOnImage }]}
              >
                {destination.title}
              </Text>
            </SharedElement>

            <Text
              numberOfLines={2}
              style={[
                theme.type.callout,
                styles.heroTagline,
                { color: theme.color.textOnImage },
              ]}
            >
              {destination.tagline}
            </Text>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

interface GridCardProps extends CardProps {
  height: number;
}

function GridCard({ destination, index, height, onPress }: GridCardProps) {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * theme.motion.stagger)
        .springify()
        .damping(theme.motion.entrance.damping)
        .stiffness(theme.motion.entrance.stiffness)}
      style={[styles.gridWrapper, theme.elevation.card]}
    >
      <PressableScale
        onPress={() => onPress(destination)}
        accessibilityLabel={destination.title}
        accessibilityHint={`Opens ${destination.title}`}
        style={styles.fill}
      >
        <View
          style={[styles.gridCard, { height, borderRadius: theme.radius.lg }]}
        >
          <SharedElement
            id={`dest.${destination.id}.photo`}
            style={StyleSheet.absoluteFill}
          >
            <Image
              source={destination.photo}
              style={[styles.fillImage, { borderRadius: theme.radius.lg }]}
              resizeMode="cover"
            />
          </SharedElement>

          <Scrim
            color={theme.color.scrim}
            intensity={0.93}
            style={styles.gridScrim}
          />

          <View style={styles.gridContent}>
            <Text
              style={[
                theme.type.overline,
                styles.overlineOnImage,
                { color: theme.color.textOnImage },
              ]}
            >
              {destination.hour.toUpperCase()}
            </Text>
            <SharedElement
              id={`dest.${destination.id}.title`}
              config={{ contentScale: 'transform', crossFade: true }}
            >
              <Text
                style={[theme.type.title3, { color: theme.color.textOnImage }]}
              >
                {destination.title}
              </Text>
            </SharedElement>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

// =============================================================================
// Screen
// =============================================================================

export function GalleryScreen({ navigation }: GalleryScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { variant, setVariantId } = useTransitionVariant();

  const handlePress = useCallback(
    (destination: Destination) => {
      navigation.navigate('Detail', { id: destination.id });
    },
    [navigation]
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.color.canvas }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: insets.top + theme.space.lg,
          paddingBottom: insets.bottom + theme.space.huge,
        }}
      >
        {/* Masthead */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.masthead}>
          <Text style={[theme.type.overline, { color: theme.color.accent }]}>
            FIELD NOTES
          </Text>
          <Text
            style={[
              theme.type.display,
              styles.mastheadTitle,
              { color: theme.color.textPrimary },
            ]}
          >
            Nine Places
          </Text>
          <Text
            style={[
              theme.type.body,
              styles.mastheadSubtitle,
              { color: theme.color.textSecondary },
            ]}
          >
            A gallery built to show off shared element transitions. Tap any
            frame — the photograph and its title fly to the next screen
            together.
          </Text>
        </Animated.View>

        {/* Variant switcher */}
        <Animated.View
          entering={FadeIn.duration(400).delay(80)}
          style={styles.switcher}
        >
          <SegmentedControl<VariantId>
            options={SEGMENT_OPTIONS}
            value={variant.id}
            onChange={setVariantId}
            accessibilityLabel="Transition style"
          />
          <Text
            style={[
              theme.type.caption,
              styles.switcherHint,
              { color: theme.color.textTertiary },
            ]}
          >
            {variant.hint}
          </Text>
        </Animated.View>

        {/* Hero */}
        {HERO ? (
          <View style={styles.section}>
            <HeroCard destination={HERO} index={0} onPress={handlePress} />
          </View>
        ) : null}

        {/* Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[theme.type.title3, { color: theme.color.textPrimary }]}>
            The archive
          </Text>
          <Text
            style={[theme.type.caption, { color: theme.color.textTertiary }]}
          >
            {GRID_ITEMS.length} frames
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.column}>
            {COLUMNS.left.map((item) => (
              <GridCard
                key={item.destination.id}
                destination={item.destination}
                index={item.index + 1}
                height={item.height}
                onPress={handlePress}
              />
            ))}
          </View>
          <View style={styles.column}>
            {COLUMNS.right.map((item) => (
              <GridCard
                key={item.destination.id}
                destination={item.destination}
                index={item.index + 1}
                height={item.height}
                onPress={handlePress}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  screen: { flex: 1 },
  fill: { flex: 1 },

  masthead: {
    paddingHorizontal: GUTTER,
    marginBottom: 20,
  },
  mastheadTitle: {
    marginTop: 6,
  },
  mastheadSubtitle: {
    marginTop: 10,
    maxWidth: 330,
  },

  switcher: {
    paddingHorizontal: GUTTER,
    marginBottom: 28,
  },
  switcherHint: {
    marginTop: 10,
    paddingHorizontal: 2,
  },

  section: {
    paddingHorizontal: GUTTER,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: GUTTER,
    marginTop: 36,
    marginBottom: 14,
  },

  // Hero card
  heroWrapper: {
    borderRadius: 28,
  },
  heroCard: {
    height: 420,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroContent: {
    padding: 22,
  },
  // Keep the top of the photograph clean — the wash only covers the type.
  heroScrim: {
    top: '34%',
  },
  gridScrim: {
    top: '24%',
  },
  heroTagline: {
    marginTop: 8,
    opacity: 0.86,
    maxWidth: 300,
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
  overlineOnImage: {
    opacity: 0.9,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    paddingHorizontal: GUTTER,
    gap: COLUMN_GAP,
  },
  column: {
    flex: 1,
    gap: COLUMN_GAP,
  },
  gridWrapper: {
    borderRadius: 20,
  },
  gridCard: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fillImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gridContent: {
    padding: 14,
  },
});

export default GalleryScreen;
