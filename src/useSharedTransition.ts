import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import type {
  SharedElementId,
  SharedTransitionConfig,
  SharedTransitionResult,
  ElementLayout,
  TransitionState,
} from './types';
import { registry } from './SharedElementRegistry';
import {
  isNativeModuleAvailable,
  prepareTransition,
  measureLayout,
} from './native/NativeModule';

/**
 * Hook for monitoring and controlling shared element transitions.
 *
 * Automatically detects when a matching SharedElement appears/disappears
 * and provides Reanimated shared values for custom animations.
 *
 * @param id - Shared element identifier to monitor
 * @param config - Transition configuration
 *
 * @example
 * const transition = useSharedTransition('hero-image', { duration: 400 });
 *
 * const animatedStyle = useAnimatedStyle(() => ({
 *   opacity: transition.animated.progress.value,
 *   transform: [
 *     { translateX: transition.animated.x.value },
 *     { translateY: transition.animated.y.value },
 *   ],
 * }));
 */
export function useSharedTransition(
  id: SharedElementId,
  config?: SharedTransitionConfig
): SharedTransitionResult {
  const duration = config?.duration ?? 300;
  const disabled = config?.disabled ?? false;

  // Current element layout (sync)
  const [layout, setLayout] = useState<ElementLayout | null>(null);
  const [state, setState] = useState<TransitionState>('idle');

  // Reanimated shared values
  const progress = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  // Track if we've started transitioning
  const hasTransitionedRef = useRef(false);

  // Update state from worklet
  const updateState = useCallback((newState: TransitionState) => {
    setState(newState);
  }, []);

  // Start transition animation
  const start = useCallback(() => {
    if (disabled) return;

    setState('transitioning');
    hasTransitionedRef.current = true;

    progress.value = withTiming(
      1,
      {
        duration,
        easing: Easing.out(Easing.cubic),
      },
      (finished?: boolean) => {
        'worklet';
        if (finished) {
          runOnJS(updateState)('completed');
        }
      }
    );
  }, [disabled, duration, progress, updateState]);

  // Reset transition
  const reset = useCallback(() => {
    progress.value = 0;
    x.value = 0;
    y.value = 0;
    width.value = 0;
    height.value = 0;
    setState('idle');
    hasTransitionedRef.current = false;
  }, [progress, x, y, width, height]);

  // Fetch native layout measurement
  const fetchNativeLayout = useCallback(async () => {
    if (!isNativeModuleAvailable()) return;

    const nativeId = `shared-element-${id}`;
    try {
      const nativeLayout = await measureLayout(nativeId);
      setLayout({
        x: nativeLayout.pageX,
        y: nativeLayout.pageY,
        width: nativeLayout.width,
        height: nativeLayout.height,
      });
    } catch {
      // Element not mounted yet or native module unavailable
    }
  }, [id]);

  // Automatic transition detection
  useEffect(() => {
    if (disabled) return;

    const unsubscribe = registry.subscribe(async (changedId) => {
      if (changedId !== id) return;
      if (hasTransitionedRef.current) return;

      // Check if we have both source and target
      const pair = registry.getTransitionPair(id);
      if (!pair) return;

      const { source, target } = pair;

      // Try to get native layouts for precision
      if (isNativeModuleAvailable()) {
        try {
          const sourceNativeId = `shared-element-${id}`;
          const prepared = await prepareTransition(
            sourceNativeId,
            sourceNativeId
          );

          // Use native measurements
          if (prepared.source.layout) {
            x.value = prepared.source.layout.pageX;
            y.value = prepared.source.layout.pageY;
            width.value = prepared.source.layout.width;
            height.value = prepared.source.layout.height;
          }

          if (prepared.target.layout) {
            x.value = withTiming(prepared.target.layout.pageX, { duration });
            y.value = withTiming(prepared.target.layout.pageY, { duration });
            width.value = withTiming(prepared.target.layout.width, {
              duration,
            });
            height.value = withTiming(prepared.target.layout.height, {
              duration,
            });
          }
        } catch {
          // Fall back to JS-measured layouts
          applyFallbackLayouts();
        }
      } else {
        applyFallbackLayouts();
      }

      function applyFallbackLayouts() {
        // Update layout with source position
        if (source.layout) {
          setLayout(source.layout);
          x.value = source.layout.x;
          y.value = source.layout.y;
          width.value = source.layout.width;
          height.value = source.layout.height;
        }

        // Animate to target position
        if (target.layout) {
          x.value = withTiming(target.layout.x, { duration });
          y.value = withTiming(target.layout.y, { duration });
          width.value = withTiming(target.layout.width, { duration });
          height.value = withTiming(target.layout.height, { duration });
        }
      }

      // Start progress animation
      start();
    });

    return unsubscribe;
  }, [id, disabled, duration, start, x, y, width, height]);

  // Initial layout fetch
  useEffect(() => {
    if (disabled) return;
    fetchNativeLayout();
  }, [disabled, fetchNativeLayout]);

  // Update current layout from registry (fallback polling)
  useEffect(() => {
    if (disabled) return;
    if (isNativeModuleAvailable()) return; // Use native measurements instead

    const interval = setInterval(() => {
      const latest = registry.getLatest(id);
      if (latest?.layout) {
        setLayout(latest.layout);
      }
    }, 100); // Poll every 100ms for layout updates

    return () => clearInterval(interval);
  }, [id, disabled]);

  return {
    layout,
    state,
    animated: {
      progress,
      x,
      y,
      width,
      height,
    },
    start,
    reset,
  };
}
