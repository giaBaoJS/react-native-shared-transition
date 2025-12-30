import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SharedElement, useSharedTransition } from 'react-native-shared-transition';

const PHOTO_URL = 'https://picsum.photos/400/300';

export default function App() {
  const [screen, setScreen] = useState<'list' | 'detail'>('list');

  return (
    <SafeAreaView style={styles.container}>
      {screen === 'list' ? (
        <ListScreen onNavigate={() => setScreen('detail')} />
      ) : (
        <DetailScreen onNavigate={() => setScreen('list')} />
      )}
    </SafeAreaView>
  );
}

function ListScreen({ onNavigate }: { onNavigate: () => void }) {
  return (
    <ScrollView style={styles.listContainer}>
      <Text style={styles.title}>Shared Element Transitions</Text>
      <Text style={styles.subtitle}>
        Tap a card to see the automatic transition
      </Text>

      <TouchableOpacity style={styles.card} onPress={onNavigate}>
        <SharedElement id="hero-image" style={styles.thumbnailContainer}>
          <Image
            source={{ uri: PHOTO_URL }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </SharedElement>

        <View style={styles.cardContent}>
          <SharedElement id="title">
            <Text style={styles.cardTitle}>Beautiful Landscape</Text>
          </SharedElement>
          <Text style={styles.cardDescription}>
            Tap to see shared element transition
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>✨ How it works:</Text>
        <Text style={styles.infoText}>
          • Elements with the same id automatically transition{'\n'}
          • No manual start() calls needed{'\n'}
          • Navigation-agnostic - works anywhere{'\n'}
          • Powered by Reanimated for 60 FPS
        </Text>
      </View>
    </ScrollView>
  );
}

function DetailScreen({ onNavigate }: { onNavigate: () => void }) {
  const transition = useSharedTransition('hero-image');

  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      transition.animated.progress.value,
      [0, 0.5, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const contentStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      transition.animated.progress.value,
      [0, 1],
      [50, 0],
      Extrapolation.CLAMP
    );
    const opacity = transition.animated.progress.value;
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.detailContainer}>
      <SharedElement id="hero-image" style={styles.heroContainer}>
        <Image
          source={{ uri: PHOTO_URL }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </SharedElement>

      <Animated.View style={[styles.overlay, overlayStyle]} />

      <TouchableOpacity style={styles.backButton} onPress={onNavigate}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.detailContent, contentStyle]}>
        <SharedElement id="title">
          <Text style={styles.detailTitle}>Beautiful Landscape</Text>
        </SharedElement>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Automatic</Text>
            <Text style={styles.statLabel}>Detection</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>60 FPS</Text>
            <Text style={styles.statLabel}>Performance</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Fabric</Text>
            <Text style={styles.statLabel}>Native</Text>
          </View>
        </View>

        <Text style={styles.detailDescription}>
          This transition happened automatically! The SharedElement component
          detected that both the thumbnail and hero image share the same "hero-image"
          id and coordinated the transition.
        </Text>

        <Text style={styles.detailDescription}>
          The useSharedTransition hook provides Reanimated shared values,
          giving you full control over the animation curve, timing, and effects.
        </Text>

        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>
            State: {transition.state}{'\n'}
            Progress: {transition.animated.progress.value.toFixed(2)}{'\n'}
            Layout: {transition.layout ? 'Available' : 'Measuring...'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    margin: 20,
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    marginTop: 0,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  heroContainer: {
    width: '100%',
    height: 400,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  detailContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginTop: -24,
  },
  detailTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  debugBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});
