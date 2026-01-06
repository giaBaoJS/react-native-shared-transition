/**
 * 🏠 HomeScreen - Beautiful Hero Gallery
 * Showcases SharedElement transitions with stunning UI
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SharedElement } from 'react-native-shared-transition';

import { Heroes } from '../assets';
import type { Hero } from '../types';
import type { HomeScreenProps } from '../navigation/types';
import {
  Colors,
  CardGradients,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../theme';

const CARD_HEIGHT = 180;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// Hero Card Component
// ============================================================================

interface HeroCardProps {
  hero: Hero;
  index: number;
  onPress: () => void;
}

function HeroCard({ hero, index, onPress }: HeroCardProps) {
  const scale = useSharedValue(1);
  const gradientColors = CardGradients[index % CardGradients.length];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.cardContainer, animatedStyle]}
      entering={FadeInDown.delay(index * 80).springify()}
    >
      {/* Gradient Background */}
      <View
        style={[styles.cardGradient, { backgroundColor: gradientColors[0] }]}
      >
        <View
          style={[
            styles.cardGradientOverlay,
            { backgroundColor: gradientColors[1], opacity: 0.6 },
          ]}
        />

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Hero Image */}
          <SharedElement id={`hero.${hero.id}.photo`}>
            <Image source={hero.photo} style={styles.heroImage} />
          </SharedElement>

          {/* Hero Info */}
          <View style={styles.heroInfo}>
            <SharedElement id={`hero.${hero.id}.name`}>
              <Text style={styles.heroName}>{hero.name}</Text>
            </SharedElement>

            {hero.class && hero.rank !== undefined && (
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>
                  {hero.class}-Class {hero.rank > 0 ? `#${hero.rank}` : ''}
                </Text>
              </View>
            )}

            <Text style={styles.heroQuote} numberOfLines={2}>
              "{hero.quote}"
            </Text>
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
      </View>
    </AnimatedPressable>
  );
}

// ============================================================================
// Header Component
// ============================================================================

function Header() {
  return (
    <Animated.View
      style={styles.header}
      entering={FadeInUp.delay(100).springify()}
    >
      <Text style={styles.headerEmoji}>⚡</Text>
      <View>
        <Text style={styles.headerTitle}>Hero Gallery</Text>
        <Text style={styles.headerSubtitle}>
          Tap a hero to see shared transitions
        </Text>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  const handleHeroPress = useCallback(
    (hero: Hero, index: number) => {
      navigation.navigate('Detail', { hero, index });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Hero; index: number }) => (
      <HeroCard
        hero={item}
        index={index}
        onPress={() => handleHeroPress(item, index)}
      />
    ),
    [handleHeroPress]
  );

  const keyExtractor = useCallback((item: Hero) => item.id, []);

  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: insets.top + Spacing.lg,
      paddingBottom: insets.bottom + Spacing.xxxl,
      paddingHorizontal: Spacing.lg,
    }),
    [insets]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={Heroes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={contentContainerStyle}
        ListHeaderComponent={Header}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.sm,
  },
  headerEmoji: {
    fontSize: 48,
    marginRight: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },

  // Card
  cardContainer: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
  },
  cardGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },

  // Hero Image
  heroImage: {
    width: 110,
    height: 110,
    borderRadius: BorderRadius.lg,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },

  // Hero Info
  heroInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  heroName: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  rankBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  rankText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroQuote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontStyle: 'italic',
    opacity: 0.8,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },

  // Decorative
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  decorCircle1: {
    width: 100,
    height: 100,
    top: -30,
    right: -20,
  },
  decorCircle2: {
    width: 60,
    height: 60,
    bottom: -15,
    right: 40,
  },
});
