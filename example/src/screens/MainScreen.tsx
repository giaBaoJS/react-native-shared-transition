/**
 * Main Screen - Beautiful Demo Menu
 */

import {
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Colors, Shadows, Router } from '../components';
import { TilesScreen } from './TilesScreen';

interface DemoCardProps {
  title: string;
  description: string;
  gradient: string[];
  icon: string;
  onPress: () => void;
}

function DemoCard({
  title,
  description,
  gradient,
  icon,
  onPress,
}: DemoCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={[styles.cardGradient, { backgroundColor: gradient[0] }]}>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text xlarge style={styles.cardTitle}>
          {title}
        </Text>
        <Text small muted style={styles.cardDescription}>
          {description}
        </Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

export function MainScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" animated />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Shared Element</Text>
          <Text style={styles.subtitle}>Transitions Demo</Text>
        </View>

        {/* Demo Cards */}
        <View style={styles.cardsContainer}>
          <DemoCard
            title="Tiles Demo"
            description="Grid layout with zoom-in image transitions"
            gradient={[Colors.primary, Colors.primaryDark]}
            icon="🖼️"
            onPress={() =>
              Router.push(<TilesScreen type="tile" title="Tiles" />, {
                duration: 400,
              })
            }
          />

          <DemoCard
            title="Cards Demo"
            description="Card reveal with multiple shared elements"
            gradient={[Colors.secondary, Colors.secondaryDark]}
            icon="🃏"
            onPress={() =>
              Router.push(<TilesScreen type="card" title="Cards" />, {
                duration: 400,
              })
            }
          />

          <DemoCard
            title="Cards Demo 2"
            description="Gradient overlay with fade transitions"
            gradient={[Colors.purple, '#6D28D9']}
            icon="✨"
            onPress={() =>
              Router.push(<TilesScreen type="card2" title="Cards 2" />, {
                duration: 450,
              })
            }
          />

          <DemoCard
            title="Avatar Demo"
            description="Circular avatar transitions"
            gradient={[Colors.cyan, '#0891B2']}
            icon="👤"
            onPress={() =>
              Router.push(<TilesScreen type="avatar" title="Avatars" />, {
                duration: 400,
              })
            }
          />
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <Text large style={styles.featuresTitle}>
            ✨ Features
          </Text>
          <View style={styles.featuresList}>
            <FeatureItem icon="🎯" text="Automatic element detection" />
            <FeatureItem icon="⚡" text="Fabric & New Architecture" />
            <FeatureItem icon="🚀" text="Nitro Modules powered" />
            <FeatureItem icon="🎬" text="60 FPS native animations" />
          </View>
        </View>

        {/* Tech Stack */}
        <View style={styles.techContainer}>
          <Text small muted style={styles.techText}>
            Built with React Native 0.83 • Nitro Modules • Reanimated
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.empty,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.dark,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
    marginTop: -8,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 16,
    ...Shadows.card,
  },
  cardGradient: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontWeight: '700',
    color: Colors.dark,
  },
  cardDescription: {
    marginTop: 4,
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: 28,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  featuresContainer: {
    marginTop: 40,
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    ...Shadows.medium,
  },
  featuresTitle: {
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.textLight,
  },
  techContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  techText: {
    textAlign: 'center',
  },
});

export default MainScreen;
