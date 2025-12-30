import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

/**
 * Unique identifier for shared elements
 */
export type SharedElementId = string;

/**
 * Layout information for an element
 */
export interface ElementLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Props for SharedElement component
 */
export interface SharedElementProps {
  /**
   * Unique identifier for this shared element.
   * Elements with the same ID across screens will transition between each other.
   */
  id: SharedElementId;

  /**
   * Content to render
   */
  children: ReactNode;

  /**
   * Style applied to the wrapper view
   */
  style?: ViewStyle;

  /**
   * Disable transitions for this element
   * @default false
   */
  disabled?: boolean;
}

/**
 * Transition state during animation
 */
export type TransitionState = 'idle' | 'transitioning' | 'completed';

/**
 * Configuration for shared transition behavior
 */
export interface SharedTransitionConfig {
  /**
   * Animation duration in milliseconds
   * @default 300
   */
  duration?: number;

  /**
   * Disable automatic transition detection
   * @default false
   */
  disabled?: boolean;
}

/**
 * Return value from useSharedTransition hook
 */
export interface SharedTransitionResult {
  /**
   * Current layout of the element (sync, immediately available)
   */
  layout: ElementLayout | null;

  /**
   * Current transition state
   */
  state: TransitionState;

  /**
   * Reanimated shared values for custom animations
   */
  animated: {
    progress: SharedValue<number>; // 0 to 1
    x: SharedValue<number>;
    y: SharedValue<number>;
    width: SharedValue<number>;
    height: SharedValue<number>;
  };

  /**
   * Manual control (for advanced use cases)
   */
  start: () => void;
  reset: () => void;
}

/**
 * Internal registry entry for tracking shared elements
 * @internal
 */
export interface SharedElementEntry {
  id: SharedElementId;
  layout: ElementLayout | null;
  timestamp: number;
}
