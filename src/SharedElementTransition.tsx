/**
 * SharedElementTransition Component
 *
 * Renders the shared element transition overlay.
 * Compatible with react-native-shared-element API.
 *
 * Usage:
 * ```tsx
 * <SharedElementTransition
 *   start={{ node: startNode, ancestor: startAncestor }}
 *   end={{ node: endNode, ancestor: endAncestor }}
 *   position={position} // Animated.Value 0-1
 *   animation="move"
 *   resize="auto"
 *   align="auto"
 * />
 * ```
 */

import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import type { ImageStyle } from 'react-native';

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
  /** Position value (0 = start, 1 = end) */
  position: Animated.Value | Animated.AnimatedInterpolation<number> | number;
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
 */
export function SharedElementTransition({
  start,
  end,
  position,
  animation = 'move',
  resize = 'auto',
  // align is reserved for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Convert position to animated value if needed
  const animPosition = useMemo(() => {
    if (typeof position === 'number') {
      return new Animated.Value(position);
    }
    return position;
  }, [position]);

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
        const [startData, endData, startSnapshot, endSnapshot] = await Promise.all([
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

        // Hide original elements
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

      // Show original elements again
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

  const { startLayout, endLayout, startSnapshot, endSnapshot } = state.measureData;

  // Calculate interpolated styles
  const containerStyle = useMemo(() => {
    const translateX = (animPosition as Animated.Value).interpolate({
      inputRange: [0, 1],
      outputRange: [startLayout.x, endLayout.x],
    });

    const translateY = (animPosition as Animated.Value).interpolate({
      inputRange: [0, 1],
      outputRange: [startLayout.y, endLayout.y],
    });

    const width = (animPosition as Animated.Value).interpolate({
      inputRange: [0, 1],
      outputRange: [startLayout.width, endLayout.width],
    });

    const height = (animPosition as Animated.Value).interpolate({
      inputRange: [0, 1],
      outputRange: [startLayout.height, endLayout.height],
    });

    return {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      transform: [{ translateX }, { translateY }],
      width,
      height,
    };
  }, [animPosition, startLayout, endLayout]);

  // Opacity styles for fade animations
  const opacityStyles = useMemo(() => {
    const startOpacity = (animPosition as Animated.Value).interpolate({
      inputRange: [0, 1],
      outputRange: animation === 'fade-in' ? [0, 0] : [1, 0],
    });

    const endOpacity = (animPosition as Animated.Value).interpolate({
      inputRange: [0, 1],
      outputRange: animation === 'fade-out' ? [0, 0] : [0, 1],
    });

    return { startOpacity, endOpacity };
  }, [animPosition, animation]);

  // Render based on animation type
  const renderContent = () => {
    const imageStyle: ImageStyle = {
      width: '100%',
      height: '100%',
      resizeMode: resize === 'stretch' ? 'stretch' : resize === 'clip' ? 'cover' : 'cover',
    };

    if (animation === 'move') {
      // Simple move - show start snapshot
      return (
        <Image
          source={{ uri: startSnapshot }}
          style={imageStyle}
        />
      );
    }

    if (animation === 'fade') {
      // Cross-fade between start and end
      return (
        <>
          <Animated.Image
            source={{ uri: startSnapshot }}
            style={[imageStyle, { opacity: opacityStyles.startOpacity, position: 'absolute' }]}
          />
          <Animated.Image
            source={{ uri: endSnapshot }}
            style={[imageStyle, { opacity: opacityStyles.endOpacity, position: 'absolute' }]}
          />
        </>
      );
    }

    if (animation === 'fade-in') {
      // Fade in the end element
      return (
        <Animated.Image
          source={{ uri: endSnapshot }}
          style={[imageStyle, { opacity: opacityStyles.endOpacity }]}
        />
      );
    }

    if (animation === 'fade-out') {
      // Fade out the start element
      return (
        <Animated.Image
          source={{ uri: startSnapshot }}
          style={[imageStyle, { opacity: opacityStyles.startOpacity }]}
        />
      );
    }

    return null;
  };

  return (
    <Animated.View style={containerStyle} pointerEvents="none">
      {renderContent()}
      {debug && (
        <View style={[StyleSheet.absoluteFill, styles.debugOverlay]} />
      )}
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
