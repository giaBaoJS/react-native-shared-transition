/**
 * 🦸 DetailScreen - Hero Detail View with Animations
 * Showcases shared element transitions in action
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SharedElement } from 'react-native-shared-transition';

import type { DetailScreenProps } from '../navigation/types';
import {
  Colors,
  CardGradients,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.55;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ============================================================================
// Back Button Component
// ============================================================================

function BackButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[styles.backButton, animatedStyle]}
      entering={FadeIn.delay(300)}
    >
      <Text style={styles.backButtonText}>←</Text>
    </AnimatedPressable>
  );
}

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  delay: number;
}

function StatCard({ icon, label, value, delay }: StatCardProps) {
  return (
    <Animated.View
      style={styles.statCard}
      entering={SlideInRight.delay(delay).springify()}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export function DetailScreen({ route, navigation }: DetailScreenProps) {
  const { hero, index } = route.params;
  const insets = useSafeAreaInsets();
  const gradientColors = CardGradients[index % CardGradients.length];

  // Animated values
  const imageScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    imageScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
  }, [imageScale, contentOpacity]);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View
        style={[
          styles.backgroundGradient,
          { backgroundColor: gradientColors[0] },
        ]}
      >
        <View
          style={[
            styles.backgroundOverlay,
            { backgroundColor: gradientColors[1] },
          ]}
        />
      </View>

      {/* Decorative Circles */}
      <Animated.View
        style={[styles.decorCircle, styles.decorCircle1]}
        entering={FadeIn.delay(400)}
      />
      <Animated.View
        style={[styles.decorCircle, styles.decorCircle2]}
        entering={FadeIn.delay(500)}
      />
      <Animated.View
        style={[styles.decorCircle, styles.decorCircle3]}
        entering={FadeIn.delay(600)}
      />

      {/* Back Button */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <BackButton onPress={handleBack} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <SharedElement id={`hero.${hero.id}.photo`}>
            <Image source={hero.photo} style={styles.heroImage} />
          </SharedElement>

          {/* Glow Effect */}
          <View
            style={[styles.imageGlow, { backgroundColor: gradientColors[1] }]}
          />
        </Animated.View>

        {/* Hero Name */}
        <Animated.View
          style={styles.nameContainer}
          entering={FadeInUp.delay(150).springify()}
        >
          <SharedElement id={`hero.${hero.id}.name`}>
            <Text style={styles.heroName}>{hero.name}</Text>
          </SharedElement>

          {hero.class && (
            <View style={styles.classBadge}>
              <Text style={styles.classText}>
                {hero.class}-Class{' '}
                {hero.rank && hero.rank > 0 ? `Rank #${hero.rank}` : 'Hero'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon="⚡" label="Power" value="∞" delay={250} />
          <StatCard icon="🛡️" label="Defense" value="MAX" delay={350} />
          <StatCard icon="💨" label="Speed" value="S+" delay={450} />
        </View>

        {/* Quote */}
        <Animated.View
          style={styles.quoteContainer}
          entering={FadeInDown.delay(400).springify()}
        >
          <Text style={styles.quoteIcon}>💬</Text>
          <Text style={styles.quoteText}>"{hero.quote}"</Text>
        </Animated.View>

        {/* Description */}
        <Animated.View
          style={styles.descriptionContainer}
          entering={FadeInDown.delay(500).springify()}
        >
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{hero.description}</Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={styles.actionsContainer}
          entering={FadeInUp.delay(600).springify()}
        >
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>View Abilities</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Share Hero</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
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

  // Background
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  // Decorative
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  decorCircle1: {
    width: 150,
    height: 150,
    top: 60,
    right: -40,
  },
  decorCircle2: {
    width: 80,
    height: 80,
    top: 180,
    left: -20,
  },
  decorCircle3: {
    width: 60,
    height: 60,
    top: 300,
    right: 30,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.text.primary,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 100,
  },

  // Image
  imageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  heroImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  imageGlow: {
    position: 'absolute',
    width: IMAGE_SIZE + 30,
    height: IMAGE_SIZE + 30,
    borderRadius: (IMAGE_SIZE + 30) / 2,
    opacity: 0.3,
    zIndex: -1,
  },

  // Name
  nameContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroName: {
    fontSize: Typography.fontSize.display,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
    letterSpacing: -1,
  },
  classBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.lavender,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  classText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  statIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },

  // Quote
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xxl,
    ...Shadows.sm,
  },
  quoteIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  quoteText: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    fontStyle: 'italic',
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
  },

  // Description
  descriptionContainer: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.lavender,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.background.card,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.lavender,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});
