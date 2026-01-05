/**
 * Detail Screen - Full-screen hero view with shared elements
 */

import { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SharedElement } from 'react-native-shared-transition';
import type { SharedElementsConfig } from 'react-native-shared-transition';
import { NavBar, Text, Colors, Router } from '../components';
import type { Hero } from '../types';
import type { TileType } from './TilesScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DetailScreenProps {
  hero: Hero;
  type?: TileType;
}

export function DetailScreen({ hero, type = 'tile' }: DetailScreenProps) {
  const [dimensions, setDimensions] = useState({
    width: SCREEN_WIDTH,
    height: Dimensions.get('window').height,
  });

  const imageHeight = dimensions.width * 0.8;

  const onLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }, []);

  const onBack = useCallback(() => {
    // Define shared elements for reverse transition
    let sharedElements: SharedElementsConfig = [];

    switch (type) {
      case 'tile':
        sharedElements = [`heroPhoto.${hero.id}`];
        break;
      case 'avatar':
        sharedElements = [
          { id: `heroPhoto.${hero.id}`, animation: 'move' },
          { id: `heroBackground.${hero.id}`, otherId: `heroPhoto.${hero.id}`, animation: 'fade-out' },
          { id: `heroName.${hero.id}`, otherId: `heroPhoto.${hero.id}`, animation: 'fade-out' },
        ];
        break;
      case 'card':
        sharedElements = [
          `heroBackground.${hero.id}`,
          `heroPhoto.${hero.id}`,
          `heroName.${hero.id}`,
          { id: `heroDescription.${hero.id}`, animation: 'fade', resize: 'clip', align: 'left-top' },
        ];
        break;
      case 'card2':
        sharedElements = [
          `heroBackground.${hero.id}`,
          `heroPhoto.${hero.id}`,
          { id: `heroOverlay.${hero.id}`, animation: 'fade' },
          { id: `heroName.${hero.id}`, animation: 'fade' },
          { id: `heroQuote.${hero.id}`, animation: 'fade' },
        ];
        break;
    }

    Router.pop({ sharedElements, duration: 400 });
  }, [hero.id, type]);

  const showGradientOverlay = type === 'card2';

  return (
    <View style={styles.container} onLayout={onLayout}>
      <StatusBar barStyle="light-content" animated />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={Platform.OS === 'ios'}
      >
        <View style={{ minHeight: dimensions.height }}>
          {/* Background */}
          <SharedElement
            id={`heroBackground.${hero.id}`}
            style={StyleSheet.absoluteFill}
          >
            <View style={styles.background} />
          </SharedElement>

          {/* Hero Image */}
          <SharedElement id={`heroPhoto.${hero.id}`}>
            <Image
              style={[styles.image, { height: imageHeight }]}
              source={hero.photo}
              resizeMode="cover"
            />
          </SharedElement>

          {/* Gradient Overlay (for card2 type) */}
          {showGradientOverlay && (
            <SharedElement
              id={`heroOverlay.${hero.id}`}
              style={[StyleSheet.absoluteFill, { height: imageHeight }]}
            >
              <View style={styles.gradientOverlay} />
            </SharedElement>
          )}

          {/* Content */}
          <View style={styles.content}>
            <SharedElement
              id={`heroName.${hero.id}`}
              style={styles.nameContainer}
            >
              <Text style={styles.name}>{hero.name}</Text>
            </SharedElement>

            {hero.quote && (
              <SharedElement
                id={`heroQuote.${hero.id}`}
                style={styles.quoteContainer}
              >
                <Text style={styles.quote}>"{hero.quote}"</Text>
              </SharedElement>
            )}

            {hero.description && (
              <SharedElement
                id={`heroDescription.${hero.id}`}
                style={styles.descriptionContainer}
              >
                <Text style={styles.description}>{hero.description}</Text>
              </SharedElement>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <StatItem label="Type" value={type.toUpperCase()} />
              <StatItem label="Animation" value="Move" />
              <StatItem label="FPS" value="60" />
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>🎬 Shared Element Transition</Text>
              <Text style={styles.infoText}>
                This transition uses native snapshot capture and Reanimated 
                for smooth 60 FPS animations. The image seamlessly morphs 
                from the list to this detail view.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* NavBar Overlay */}
      <SharedElement
        id={`heroCloseButton.${hero.id}`}
        style={styles.navBar}
      >
        <NavBar
          light
          back="close"
          onBack={onBack}
        />
      </SharedElement>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.back,
  },
  scroll: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: Colors.back,
  },
  image: {
    width: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 24,
    paddingTop: 16,
  },
  nameContainer: {
    alignSelf: 'flex-start',
  },
  name: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: -0.5,
  },
  quoteContainer: {
    marginTop: 8,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.textLight,
    lineHeight: 24,
  },
  descriptionContainer: {
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.separator,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: Colors.empty,
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
  },
  navBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 100,
  },
});

export default DetailScreen;
