/**
 * SharedTransitionOverlay
 *
 * Overlay component that renders SharedElementTransition during navigation.
 * Demonstrates usage of SharedElementTransition, useSharedTransition, useSharedTransitionValue.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {
  SharedElementTransition,
  SharedElementRegistry,
  type SharedElementNode,
  type SharedElementAnimation,
} from 'react-native-shared-transition';

interface TransitionData {
  elementId: string;
  startNode: SharedElementNode;
  endNode: SharedElementNode;
  animation: SharedElementAnimation;
}

interface SharedTransitionOverlayProps {
  /** Duration of the transition in ms */
  duration?: number;
  /** Debug mode */
  debug?: boolean;
}

/**
 * SharedTransitionOverlay
 *
 * This component:
 * 1. Listens to SharedElementRegistry for element changes
 * 2. When a transition pair is detected, captures nodes
 * 3. Renders SharedElementTransition with animated progress
 * 4. Uses useSharedTransitionValue for controlling animation
 */
export function SharedTransitionOverlay({
  duration = 400,
  debug = false,
}: SharedTransitionOverlayProps) {
  // Active transitions
  const [transitions, setTransitions] = useState<TransitionData[]>([]);

  // Animation progress using Reanimated SharedValue
  const progress = useSharedValue(0);

  // Track active element IDs
  const activeIdsRef = useRef<Set<string>>(new Set());

  // Cleanup transition
  const cleanupTransition = useCallback((elementId: string) => {
    setTransitions((prev) => prev.filter((t) => t.elementId !== elementId));
    activeIdsRef.current.delete(elementId);
  }, []);

  // Handle registry changes
  useEffect(() => {
    const unsubscribe = SharedElementRegistry.subscribe((elementId, nodes) => {
      // When we have 2+ nodes for same ID, we have a transition pair
      if (nodes.length >= 2) {
        const startNode = nodes[0];
        const endNode = nodes[nodes.length - 1];

        // Check if already active
        if (activeIdsRef.current.has(elementId)) return;

        // Ensure nodes are valid
        if (!startNode || !endNode) return;

        // Start transition
        if (debug) {
          console.log(
            `[SharedTransition] Starting transition for: ${elementId}`
          );
        }

        activeIdsRef.current.add(elementId);
        setTransitions((prev) => [
          ...prev,
          {
            elementId,
            startNode,
            endNode,
            animation: 'move',
          },
        ]);

        // Animate progress
        progress.value = 0;
        progress.value = withTiming(
          1,
          {
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          },
          (finished) => {
            if (finished) {
              // Clean up after transition completes
              runOnJS(cleanupTransition)(elementId);
            }
          }
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [duration, progress, debug, cleanupTransition]);

  // Don't render if no active transitions
  if (transitions.length === 0) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      {transitions.map((transition) => (
        <SharedElementTransition
          key={transition.elementId}
          start={{ node: transition.startNode }}
          end={{ node: transition.endNode }}
          position={progress}
          animation={transition.animation}
          resize="auto"
          align="auto"
          debug={debug}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
});

export default SharedTransitionOverlay;
