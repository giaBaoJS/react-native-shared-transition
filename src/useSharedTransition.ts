/**
 * useSharedTransition Hook
 *
 * React hook for controlling shared element transitions.
 * Works with both manual control and automatic detection.
 *
 * Usage:
 * ```tsx
 * const { progress, start, reset, state } = useSharedTransition('hero-image', {
 *   duration: 300,
 * });
 *
 * // Use progress in Reanimated animated styles
 * const animatedStyle = useAnimatedStyle(() => ({
 *   opacity: progress.value,
 * }));
 * ```
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Animated } from 'react-native';

import type {
  SharedElementId,
  TransitionState,
  UseSharedTransitionConfig,
  UseSharedTransitionResult,
} from './types';
import { SharedElementRegistry } from './SharedElementRegistry';

// Default configuration
const DEFAULT_CONFIG: Required<UseSharedTransitionConfig> = {
  duration: 300,
  debug: false,
  easing: 'easeInOut',
};

/**
 * useSharedTransition Hook
 *
 * Provides control over a shared element transition.
 */
export function useSharedTransition(
  elementId: SharedElementId,
  config?: UseSharedTransitionConfig
): UseSharedTransitionResult {
  // Merge config with defaults
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Animation progress (0-1)
  const progressRef = useRef(new Animated.Value(0));
  const [progress, setProgress] = useState(0);

  // Transition state
  const [state, setState] = useState<TransitionState>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Track if auto-started
  const autoStartedRef = useRef(false);

  // Subscribe to registry changes for auto-detection
  useEffect(() => {
    const unsubscribe = SharedElementRegistry.subscribe((changedId, nodes) => {
      // Only care about our element
      if (changedId !== elementId) return;

      // Check if we have a transition pair
      if (nodes.length >= 2 && !autoStartedRef.current && state === 'idle') {
        // Auto-start transition
        autoStartedRef.current = true;
        startTransition();
      }

      // Check if transition ended (one element unmounted)
      if (nodes.length < 2 && autoStartedRef.current && state === 'running') {
        // Auto-complete transition
        completeTransition();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [elementId, state]);

  // Start the transition animation
  const startTransition = useCallback(async () => {
    if (state === 'running') return;

    setState('preparing');
    setError(null);

    try {
      // Check if we have both elements
      const pair = SharedElementRegistry.getTransitionPair(elementId);
      if (!pair) {
        throw new Error(`No transition pair found for element: ${elementId}`);
      }

      setState('running');

      // Animate progress from 0 to 1
      await new Promise<void>((resolve) => {
        Animated.timing(progressRef.current, {
          toValue: 1,
          duration: mergedConfig.duration,
          useNativeDriver: false, // Need to animate layout
        }).start(({ finished }) => {
          if (finished) {
            resolve();
          }
        });
      });

      setState('completed');
    } catch (err) {
      setError(err as Error);
      setState('error');
    }
  }, [elementId, mergedConfig.duration, state]);

  // Complete the transition
  const completeTransition = useCallback(() => {
    progressRef.current.setValue(1);
    setProgress(1);
    setState('completed');
  }, []);

  // Reset the transition
  const reset = useCallback(() => {
    progressRef.current.setValue(0);
    setProgress(0);
    setState('idle');
    setError(null);
    autoStartedRef.current = false;
  }, []);

  // Manual start function
  const start = useCallback(async () => {
    autoStartedRef.current = true;
    await startTransition();
  }, [startTransition]);

  // Track progress value
  useEffect(() => {
    const listenerId = progressRef.current.addListener(({ value }) => {
      setProgress(value);
    });

    return () => {
      progressRef.current.removeListener(listenerId);
    };
  }, []);

  return {
    state,
    progress,
    start,
    reset,
    error,
  };
}

/**
 * Get the Animated.Value directly for use in animations
 */
export function useSharedTransitionValue(
  elementId: SharedElementId,
  config?: UseSharedTransitionConfig
): {
  animatedValue: Animated.Value;
  state: TransitionState;
  start: () => Promise<void>;
  reset: () => void;
} {
  const result = useSharedTransition(elementId, config);

  // Create a stable animated value
  const animatedValueRef = useRef(new Animated.Value(0));

  // Sync progress to animated value
  useEffect(() => {
    animatedValueRef.current.setValue(result.progress);
  }, [result.progress]);

  return {
    animatedValue: animatedValueRef.current,
    state: result.state,
    start: result.start,
    reset: result.reset,
  };
}

export default useSharedTransition;
