/**
 * Demo Screen
 *
 * Shows detailed usage of:
 * - SharedElement
 * - SharedElementTransition
 * - useSharedTransition
 * - useSharedTransitionValue
 */

import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
  SharedElement,
  SharedElementTransition,
  useSharedTransitionValue,
  SharedElementRegistry,
  type SharedElementNode,
} from 'react-native-shared-transition';

import type { DemoScreenProps } from '../navigation/types';

/**
 * DemoScreen Component
 *
 * Demonstrates manual control of shared element transitions.
 */
export function DemoScreen({
  route,
  navigation: _navigation,
}: DemoScreenProps) {
  const { hero } = route.params;

  // State for nodes
  const [startNode, setStartNode] = useState<SharedElementNode | null>(null);
  const [endNode, setEndNode] = useState<SharedElementNode | null>(null);

  // Use the hook to control transitions
  const { progress, state, start, reset } = useSharedTransitionValue(
    `demo.${hero.id}`,
    {
      duration: 500,
      debug: true,
    }
  );

  // Animated style based on progress
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + progress.value * 0.7, // 0.3 -> 1
      transform: [{ scale: 0.8 + progress.value * 0.2 }], // 0.8 -> 1
    };
  });

  // Handle node registration
  const handleStartNode = useCallback((node: SharedElementNode | null) => {
    setStartNode(node);
    console.log('[Demo] Start node:', node);
  }, []);

  const handleEndNode = useCallback((node: SharedElementNode | null) => {
    setEndNode(node);
    console.log('[Demo] End node:', node);
  }, []);

  // Log state changes
  useEffect(() => {
    console.log(`[DemoScreen] State: ${state}`);
  }, [state]);

  // Check registry
  useEffect(() => {
    const elementId = `demo.${hero.id}`;
    const pair = SharedElementRegistry.getTransitionPair(elementId);
    console.log(`[DemoScreen] Transition pair for ${elementId}:`, pair);
  }, [hero.id, startNode, endNode]);

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>State: </Text>
        <Text style={styles.statusValue}>{state}</Text>
      </View>

      {/* Demo Area - Two SharedElements with same ID */}
      <View style={styles.demoArea}>
        <Text style={styles.sectionTitle}>📍 SharedElement Demo</Text>
        <Text style={styles.sectionDesc}>
          Two SharedElement components with the same ID create a transition pair
        </Text>

        <View style={styles.imagesRow}>
          {/* Small Image (Start) */}
          <View style={styles.imageBox}>
            <SharedElement id={`demo.${hero.id}`} onNode={handleStartNode}>
              <Image source={hero.photo} style={styles.smallImage} />
            </SharedElement>
            <Text style={styles.label}>Start (80x80)</Text>
          </View>

          {/* Arrow */}
          <Text style={styles.arrow}>→</Text>

          {/* Large Image (End) */}
          <View style={styles.imageBox}>
            <SharedElement id={`demo.${hero.id}`} onNode={handleEndNode}>
              <Image source={hero.photo} style={styles.largeImage} />
            </SharedElement>
            <Text style={styles.label}>End (140x140)</Text>
          </View>
        </View>
      </View>

      {/* Animated Indicator using progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎬 useSharedTransitionValue</Text>
        <Text style={styles.sectionDesc}>
          Returns a Reanimated SharedValue for smooth animations
        </Text>

        <Animated.View style={[styles.indicator, animatedStyle]}>
          <Text style={styles.indicatorText}>
            Progress: {progress.value.toFixed(2)}
          </Text>
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Controls</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={start}
          >
            <Text style={styles.buttonText}>▶ Start</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={reset}
          >
            <Text style={styles.buttonText}>↺ Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SharedElementTransition Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 SharedElementTransition</Text>
        <Text style={styles.sectionDesc}>
          Renders animated overlay between two elements
        </Text>

        <View style={styles.transitionContainer}>
          {startNode && endNode ? (
            <SharedElementTransition
              start={{ node: startNode }}
              end={{ node: endNode }}
              position={progress}
              animation="move"
              resize="auto"
              debug={true}
            />
          ) : (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                Waiting for both nodes to register...
              </Text>
              <Text style={styles.waitingSubtext}>
                Start: {startNode ? '✅' : '⏳'} | End: {endNode ? '✅' : '⏳'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>📚 Components Used:</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>•</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoName}>SharedElement</Text>
            <Text style={styles.infoDesc}>
              Wraps views to mark for transitions
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>•</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoName}>useSharedTransitionValue</Text>
            <Text style={styles.infoDesc}>
              Returns SharedValue for Reanimated animations
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>•</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoName}>SharedElementTransition</Text>
            <Text style={styles.infoDesc}>
              Renders the animated transition overlay
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2c3e50',
  },
  statusLabel: {
    color: '#bdc3c7',
    fontSize: 16,
    fontWeight: '500',
  },
  statusValue: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: '700',
  },
  demoArea: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  imageBox: {
    alignItems: 'center',
  },
  smallImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  largeImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 32,
    color: '#3498db',
    fontWeight: '300',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  indicator: {
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  indicatorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transitionContainer: {
    height: 180,
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingContainer: {
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  waitingSubtext: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#e8f6ff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2980b9',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 16,
    color: '#3498db',
    marginRight: 8,
    fontWeight: '700',
  },
  infoContent: {
    flex: 1,
  },
  infoName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  infoDesc: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
});

export default DemoScreen;
