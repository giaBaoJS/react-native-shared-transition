/**
 * SharedElementTransition Component
 *
 * Renders the shared element transition overlay using react-native-reanimated
 * for smooth 60fps UI thread animations.
 *
 * Usage:
 * ```tsx
 * <SharedElementTransition
 *   start={{ node: startNode, ancestor: startAncestor }}
 *   end={{ node: endNode, ancestor: endAncestor }}
 *   position={progress} // SharedValue<number> 0-1
 *   animation="move"
 *   resize="auto"
 *   align="auto"
 * />
 * ```
 */

import { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import type { ImageStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';

import type {
  SharedElementNode,
  SharedElementAnimation,
  SharedElementResize,
  SharedElementAlign,
} from './types';
import {
  measureNode,
  captureSnapshot,
  isNativeModuleAvailable,
  setNodeHidden,
} from './native/NativeModule';
import type { SharedElementLayout } from './specs/SharedTransitionModule.nitro';

/**
 * Transition endpoint
 */
export interface TransitionEndpoint {
  /** The shared element node */
  node?: SharedElementNode | null;
  /** Ancestor node for relative positioning */
  ancestor?: SharedElementNode | null;
}

/**
 * Props for SharedElementTransition
 */
export interface SharedElementTransitionProps {
  /** Start endpoint (source screen) */
  start: TransitionEndpoint;
  /** End endpoint (target screen) */
  end: TransitionEndpoint;
  /** Position value (0 = start, 1 = end) - Reanimated SharedValue */
  position: SharedValue<number>;
  /** Animation type */
  animation?: SharedElementAnimation;
  /** Resize behavior */
  resize?: SharedElementResize;
  /** Alignment behavior */
  align?: SharedElementAlign;
  /** Debug mode - renders colored overlays */
  debug?: boolean;
  /** Callback when measurement completes */
  onMeasure?: (data: MeasureData | null) => void;
}

/**
 * Data from measurement
 */
export interface MeasureData {
  startLayout: SharedElementLayout;
  endLayout: SharedElementLayout;
  startSnapshot: string;
  endSnapshot: string;
}

/**
 * Internal state for the transition
 */
interface TransitionState {
  /** Measurement data */
  measureData: MeasureData | null;
  /** Whether we're still measuring */
  isMeasuring: boolean;
  /** Error if any */
  error: Error | null;
}

/**
 * SharedElementTransition Component
 *
 * Uses Reanimated exclusively for optimal performance.
 */
export function SharedElementTransition({
  start,
  end,
  position,
  animation = 'move',
  resize = 'auto',
  align: _align = 'auto',
  debug = false,
  onMeasure,
}: SharedElementTransitionProps) {
  // State for measurement
  const [state, setState] = useState<TransitionState>({
    measureData: null,
    isMeasuring: true,
    error: null,
  });

  // Measure both endpoints
  useEffect(() => {
    let cancelled = false;

    async function measure() {
      const startNode = start.node;
      const endNode = end.node;

      if (!startNode || !endNode) {
        setState({ measureData: null, isMeasuring: false, error: null });
        return;
      }

      if (!isNativeModuleAvailable()) {
        setState({
          measureData: null,
          isMeasuring: false,
          error: new Error('Native module not available'),
        });
        return;
      }

      try {
        // Measure and capture both nodes in parallel
        const [startData, endData, startSnapshot, endSnapshot] =
          await Promise.all([
            measureNode(startNode.nativeId),
            measureNode(endNode.nativeId),
            captureSnapshot(startNode.nativeId),
            captureSnapshot(endNode.nativeId),
          ]);

        if (cancelled) return;

        const measureData: MeasureData = {
          startLayout: startData.layout,
          endLayout: endData.layout,
          startSnapshot,
          endSnapshot,
        };

        setState({
          measureData,
          isMeasuring: false,
          error: null,
        });

        onMeasure?.(measureData);

        // Hide original elements during transition
        setNodeHidden(startNode.nativeId, true);
        setNodeHidden(endNode.nativeId, true);
      } catch (error) {
        if (cancelled) return;

        setState({
          measureData: null,
          isMeasuring: false,
          error: error as Error,
        });

        onMeasure?.(null);
      }
    }

    measure();

    return () => {
      cancelled = true;

      // Show original elements again when transition unmounts
      if (start.node) {
        setNodeHidden(start.node.nativeId, false);
      }
      if (end.node) {
        setNodeHidden(end.node.nativeId, false);
      }
    };
  }, [start.node, end.node, onMeasure]);

  // If no data, don't render
  if (state.isMeasuring || !state.measureData) {
    if (debug && state.error) {
      return (
        <View style={styles.debug}>
          <View style={styles.debugError} />
        </View>
      );
    }
    return null;
  }

  const { startLayout, endLayout, startSnapshot, endSnapshot } =
    state.measureData;

  return (
    <TransitionContent
      position={position}
      startLayout={startLayout}
      endLayout={endLayout}
      startSnapshot={startSnapshot}
      endSnapshot={endSnapshot}
      animation={animation}
      resize={resize}
      debug={debug}
    />
  );
}

/**
 * Inner component that uses Reanimated hooks
 * Separated to ensure hooks are called unconditionally
 */
function TransitionContent({
  position,
  startLayout,
  endLayout,
  startSnapshot,
  endSnapshot,
  animation,
  resize,
  debug,
}: {
  position: SharedValue<number>;
  startLayout: SharedElementLayout;
  endLayout: SharedElementLayout;
  startSnapshot: string;
  endSnapshot: string;
  animation: SharedElementAnimation;
  resize: SharedElementResize;
  debug: boolean;
}) {
  // Container animated style - interpolates position, size
  const containerStyle = useAnimatedStyle(() => {
    const progress = position.value;
    // Handle fractional progress (for screen index-based position)
    const clampedProgress = Math.max(0, Math.min(1, progress - Math.floor(progress)));

    return {
      position: 'absolute',
      left: 0,
      top: 0,
      transform: [
        {
          translateX: interpolate(
            clampedProgress,
            [0, 1],
            [startLayout.x, endLayout.x]
          ),
        },
        {
          translateY: interpolate(
            clampedProgress,
            [0, 1],
            [startLayout.y, endLayout.y]
          ),
        },
      ],
      width: interpolate(
        clampedProgress,
        [0, 1],
        [startLayout.width, endLayout.width]
      ),
      height: interpolate(
        clampedProgress,
        [0, 1],
        [startLayout.height, endLayout.height]
      ),
    };
  }, [position, startLayout, endLayout]);

  // Derived values for opacity animations
  const startOpacity = useDerivedValue(() => {
    const progress = position.value - Math.floor(position.value);
    if (animation === 'fade-in') return 0;
    return interpolate(progress, [0, 1], [1, 0]);
  }, [position, animation]);

  const endOpacity = useDerivedValue(() => {
    const progress = position.value - Math.floor(position.value);
    if (animation === 'fade-out') return 0;
    return interpolate(progress, [0, 1], [0, 1]);
  }, [position, animation]);

  // Image styles
  const startImageStyle = useAnimatedStyle(() => ({
    opacity: startOpacity.value,
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
  }));

  const endImageStyle = useAnimatedStyle(() => ({
    opacity: endOpacity.value,
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
  }));

  // Base image style
  const imageResizeMode =
    resize === 'stretch' ? 'stretch' : resize === 'clip' ? 'cover' : 'cover';

  const baseImageStyle: ImageStyle = {
    width: '100%',
    height: '100%',
    resizeMode: imageResizeMode,
  };

  // Render content based on animation type
  const renderContent = () => {
    if (animation === 'move') {
      // Simple move - show start snapshot
      return <Image source={{ uri: startSnapshot }} style={baseImageStyle} />;
    }

    if (animation === 'fade') {
      // Cross-fade between start and end
      return (
        <>
          <Animated.Image
            source={{ uri: startSnapshot }}
            style={[baseImageStyle, startImageStyle]}
          />
          <Animated.Image
            source={{ uri: endSnapshot }}
            style={[baseImageStyle, endImageStyle]}
          />
        </>
      );
    }

    if (animation === 'fade-in') {
      // Fade in the end element
      return (
        <Animated.Image
          source={{ uri: endSnapshot }}
          style={[baseImageStyle, endImageStyle]}
        />
      );
    }

    if (animation === 'fade-out') {
      // Fade out the start element
      return (
        <Animated.Image
          source={{ uri: startSnapshot }}
          style={[baseImageStyle, startImageStyle]}
        />
      );
    }

    return null;
  };

  return (
    <Animated.View style={containerStyle} pointerEvents="none">
      {renderContent()}
      {debug && <View style={[StyleSheet.absoluteFill, styles.debugOverlay]} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  debug: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  debugError: {
    width: 50,
    height: 50,
    backgroundColor: 'red',
    opacity: 0.5,
  },
  debugOverlay: {
    borderWidth: 2,
    borderColor: 'blue',
    backgroundColor: 'rgba(0, 0, 255, 0.1)',
  },
});

export default SharedElementTransition;
