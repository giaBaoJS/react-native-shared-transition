/**
 * Public type definitions for react-native-shared-transition.
 */

import type { ReactElement, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type {
  MeasuredFrame,
  SnapshotResult,
} from './specs/SharedTransitionModule.nitro';

/**
 * Unique identifier that matches shared elements across screens.
 */
export type SharedElementId = string;

/**
 * Animation driver for a transition.
 */
export type SharedTransitionAnimation = 'spring' | 'timing';

/**
 * Named easing curves for `timing` transitions.
 */
export type SharedTransitionEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';

/**
 * How the overlay content follows the animated frame.
 *
 * - `'resize'`  — the content is laid out at the animated size every frame.
 *                 Best for images (resizeMode is respected while morphing).
 * - `'transform'` — the content is laid out once at the destination size and
 *                 scaled with a transform. Best for text and complex views
 *                 whose internal layout should not reflow mid-flight.
 */
export type SharedTransitionContentScale = 'resize' | 'transform';

/**
 * Spring parameters (react-native-reanimated `withSpring`).
 */
export interface SharedTransitionSpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
  overshootClamping?: boolean;
}

/**
 * Fully-resolved transition configuration.
 */
export interface SharedTransitionConfig {
  /** Animation driver @default 'spring' */
  animation: SharedTransitionAnimation;
  /** Duration in ms (timing only) @default 320 */
  duration: number;
  /** Easing curve (timing only) @default 'ease-in-out' */
  easing: SharedTransitionEasing;
  /** Spring parameters (spring only) */
  spring: Required<SharedTransitionSpringConfig>;
  /**
   * Cross-fade the source content into the target content while morphing.
   * Enable when the two elements render different content (e.g. text with
   * different font sizes). @default false
   */
  crossFade: boolean;
  /**
   * Animate borderRadius between the source and target styles.
   * @default true
   */
  morphBorderRadius: boolean;
  /** How overlay content follows the animated frame. @default 'resize' */
  contentScale: SharedTransitionContentScale;
}

/**
 * Partial configuration accepted everywhere a config can be passed.
 */
export type SharedTransitionConfigInput = Partial<
  Omit<SharedTransitionConfig, 'spring'>
> & {
  spring?: SharedTransitionSpringConfig;
};

export const DEFAULT_TRANSITION_CONFIG: SharedTransitionConfig = {
  animation: 'spring',
  duration: 320,
  easing: 'ease-in-out',
  spring: {
    damping: 26,
    stiffness: 290,
    mass: 1,
    overshootClamping: false,
  },
  crossFade: false,
  morphBorderRadius: true,
  contentScale: 'resize',
};

/**
 * Merge any number of partial configs (later wins) on top of the defaults.
 */
export function resolveTransitionConfig(
  ...configs: Array<SharedTransitionConfigInput | undefined>
): SharedTransitionConfig {
  const result: SharedTransitionConfig = {
    ...DEFAULT_TRANSITION_CONFIG,
    spring: { ...DEFAULT_TRANSITION_CONFIG.spring },
  };
  for (const config of configs) {
    if (!config) continue;
    const { spring, ...rest } = config;
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        (result as unknown as Record<string, unknown>)[key] = value;
      }
    }
    if (spring) {
      result.spring = { ...result.spring, ...spring };
    }
  }
  return result;
}

/**
 * Props for the {@link SharedElement} component.
 */
export interface SharedElementProps {
  /** Matches elements across screens — same id on both sides transitions. */
  id: SharedElementId;
  /** Style for the wrapper view. */
  style?: StyleProp<ViewStyle>;
  /** The element to transition (a single child). */
  children: ReactNode;
  /** Per-element transition config, merged over the host default. */
  config?: SharedTransitionConfigInput;
}

/**
 * State of a shared element transition exposed by the hook.
 */
export interface SharedTransitionSnapshot {
  /** True while any transition (or the one for `id`) is in flight. */
  isTransitioning: boolean;
  /** Element ids currently in flight. */
  activeIds: SharedElementId[];
}

/**
 * Internal registry record for a mounted SharedElement.
 */
export interface SharedElementRecord {
  id: SharedElementId;
  nativeId: string;
  /** Clone template — the SharedElement's child. */
  element: ReactElement | null;
  /** borderRadius extracted from the child's style. */
  borderRadius: number;
  /** Static border styles extracted from the child (drawn on the overlay). */
  borderWidth: number;
  borderColor: string | undefined;
  config?: SharedTransitionConfigInput;
  /** Registration order (monotonic). */
  sequence: number;
  layoutReady: boolean;
  /** Last frame measured during a transition (window coords). */
  lastFrame:
    | import('./specs/SharedTransitionModule.nitro').MeasuredFrame
    | null;
}
