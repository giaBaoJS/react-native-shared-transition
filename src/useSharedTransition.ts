/**
 * useSharedTransition Hook
 *
 * React hook for controlling shared element transitions.
 * Uses react-native-reanimated for smooth UI thread animations.
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
import {
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

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
 * Provides control over a shared element transition using Reanimated.
 */
export function useSharedTransition(
  elementId: SharedElementId,
  config?: UseSharedTransitionConfig
): UseSharedTransitionResult {
  // Merge config with defaults
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Animation progress (0-1) using Reanimated SharedValue
  const progress = useSharedValue(0);

  // Transition state
  const [state, setState] = useState<TransitionState>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Track if auto-started
  const autoStartedRef = useRef(false);

  // Callback to update state from worklet
  const updateState = useCallback((newState: TransitionState) => {
    setState(newState);
  }, []);

  // Complete the transition
  const completeTransition = useCallback(() => {
    progress.value = 1;
    setState('completed');
  }, [progress]);

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

      // Animate progress from 0 to 1 using Reanimated
      const easing =
        mergedConfig.easing === 'easeInOut'
          ? Easing.inOut(Easing.ease)
          : mergedConfig.easing === 'easeIn'
          ? Easing.in(Easing.ease)
          : mergedConfig.easing === 'easeOut'
          ? Easing.out(Easing.ease)
          : Easing.linear;

      progress.value = withTiming(
        1,
        {
          duration: mergedConfig.duration,
          easing,
        },
        (finished) => {
          if (finished) {
            runOnJS(updateState)('completed');
          }
        }
      );
    } catch (err) {
      setError(err as Error);
      setState('error');
    }
  }, [
    elementId,
    mergedConfig.duration,
    mergedConfig.easing,
    state,
    progress,
    updateState,
  ]);

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
  }, [elementId, state, startTransition, completeTransition]);

  // Reset the transition
  const reset = useCallback(() => {
    progress.value = 0;
    setState('idle');
    setError(null);
    autoStartedRef.current = false;
  }, [progress]);

  // Manual start function
  const start = useCallback(async () => {
    autoStartedRef.current = true;
    await startTransition();
  }, [startTransition]);

  return {
    state,
    progress: progress.value,
    start,
    reset,
    error,
  };
}

/**
 * Get the SharedValue directly for use in Reanimated animations
 */
export function useSharedTransitionValue(
  elementId: SharedElementId,
  config?: UseSharedTransitionConfig
): {
  progress: SharedValue<number>;
  state: TransitionState;
  start: () => Promise<void>;
  reset: () => void;
} {
  // Merge config with defaults
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Animation progress using Reanimated SharedValue
  const progress = useSharedValue(0);

  // Transition state
  const [state, setState] = useState<TransitionState>('idle');

  // Track if auto-started
  const autoStartedRef = useRef(false);

  // Callback to update state from worklet
  const updateState = useCallback((newState: TransitionState) => {
    setState(newState);
  }, []);

  // Start the transition animation
  const start = useCallback(async () => {
    if (state === 'running') return;

    setState('preparing');

    // Check if we have both elements
    const pair = SharedElementRegistry.getTransitionPair(elementId);
    if (!pair) {
      setState('error');
      return;
    }

    setState('running');
    autoStartedRef.current = true;

    // Animate using Reanimated
    const easing =
      mergedConfig.easing === 'easeInOut'
        ? Easing.inOut(Easing.ease)
        : mergedConfig.easing === 'easeIn'
        ? Easing.in(Easing.ease)
        : mergedConfig.easing === 'easeOut'
        ? Easing.out(Easing.ease)
        : Easing.linear;

    progress.value = withTiming(
      1,
      {
        duration: mergedConfig.duration,
        easing,
      },
      (finished) => {
        if (finished) {
          runOnJS(updateState)('completed');
        }
      }
    );
  }, [
    elementId,
    mergedConfig.duration,
    mergedConfig.easing,
    state,
    progress,
    updateState,
  ]);

  // Reset the transition
  const reset = useCallback(() => {
    progress.value = 0;
    setState('idle');
    autoStartedRef.current = false;
  }, [progress]);

  return {
    progress,
    state,
    start,
    reset,
  };
}

export default useSharedTransition;
