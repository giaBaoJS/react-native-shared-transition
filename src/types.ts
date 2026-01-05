/**
 * Type definitions for react-native-shared-transition
 *
 * API design compatible with react-native-shared-element
 */

import type { ViewStyle, StyleProp } from 'react-native';

// Re-export native types
export type {
  SharedElementLayout,
  SharedElementAnimation,
  SharedElementResize,
  SharedElementAlign,
  SharedElementContentType,
} from './specs/SharedTransitionModule.nitro';

/**
 * Unique identifier for shared elements
 */
export type SharedElementId = string;

/**
 * Node reference returned by SharedElement
 * Used internally for tracking
 */
export interface SharedElementNode {
  /** Unique nativeID for this instance */
  nativeId: string;
  /** User-provided transition ID */
  transitionId: SharedElementId;
  /** Ancestor nativeID (for relative positioning) */
  ancestorId?: string;
}

/**
 * Props for SharedElement component
 */
export interface SharedElementProps {
  /**
   * Unique ID to match elements across screens
   * Elements with the same ID will transition together
   */
  id: SharedElementId;

  /**
   * Style applied to the wrapper view
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Children to wrap (should be a single element)
   */
  children: React.ReactNode;

  /**
   * Callback when the node is ready
   * @param node - The node reference or null when unmounting
   */
  onNode?: (node: SharedElementNode | null) => void;
}

  /**
 * Configuration for a single shared element in a transition
 */
export interface SharedElementConfig {
  /** The ID of the shared element */
  id: SharedElementId;

  /** Optional different ID on the other screen (rare) */
  otherId?: SharedElementId;

  /** Animation type */
  animation?: import('./specs/SharedTransitionModule.nitro').SharedElementAnimation;

  /** Resize behavior */
  resize?: import('./specs/SharedTransitionModule.nitro').SharedElementResize;

  /** Alignment behavior */
  align?: import('./specs/SharedTransitionModule.nitro').SharedElementAlign;

  /** Enable debug mode for this element */
  debug?: boolean;
}

/**
 * Simplified config - just the ID string
 */
export type SharedElementsConfigInput =
  | SharedElementConfig
  | SharedElementId;

/**
 * Full config array for transitions
 */
export type SharedElementsConfig = SharedElementsConfigInput[];

/**
 * Normalized config (always has all fields)
 */
export interface SharedElementStrictConfig {
  id: SharedElementId;
  otherId: SharedElementId;
  animation: import('./specs/SharedTransitionModule.nitro').SharedElementAnimation;
  resize: import('./specs/SharedTransitionModule.nitro').SharedElementResize;
  align: import('./specs/SharedTransitionModule.nitro').SharedElementAlign;
  debug: boolean;
}

/**
 * Transition state
 */
export type TransitionState =
  | 'idle'
  | 'preparing'
  | 'running'
  | 'completed'
  | 'error';

/**
 * Configuration for useSharedTransition hook
 */
export interface UseSharedTransitionConfig {
  /** Animation duration in milliseconds */
  duration?: number;

  /** Enable debug mode */
  debug?: boolean;

  /** Custom easing function name (for Reanimated) */
  easing?: string;
}

/**
 * Result from useSharedTransition hook
 */
export interface UseSharedTransitionResult {
  /** Current transition state */
  state: TransitionState;

  /** Progress value (0-1) */
  progress: number;

  /** Start the transition */
  start: () => Promise<void>;

  /** Reset/cancel the transition */
  reset: () => void;

  /** Error if any */
  error: Error | null;
}

// =============================================================================
// Helper functions
// =============================================================================

/**
 * Normalize a shared element config to strict format
 */
export function normalizeSharedElementConfig(
  config: SharedElementsConfigInput
): SharedElementStrictConfig {
  if (typeof config === 'string') {
    return {
      id: config,
      otherId: config,
      animation: 'move',
      resize: 'auto',
      align: 'auto',
      debug: false,
    };
}

  return {
    id: config.id,
    otherId: config.otherId ?? config.id,
    animation: config.animation ?? 'move',
    resize: config.resize ?? 'auto',
    align: config.align ?? 'auto',
    debug: config.debug ?? false,
  };
}

/**
 * Normalize array of configs
 */
export function normalizeSharedElementsConfig(
  configs: SharedElementsConfig | undefined
): SharedElementStrictConfig[] | undefined {
  if (!configs || configs.length === 0) return undefined;
  return configs.map(normalizeSharedElementConfig);
}
