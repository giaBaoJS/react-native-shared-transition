/**
 * react-native-shared-transition
 *
 * Modern shared element transitions for React Native.
 * Built for the New Architecture with Nitro Modules and Reanimated.
 */

// =============================================================================
// Components
// =============================================================================

export { SharedElement } from './SharedElement';
export { SharedTransitionHost } from './SharedTransitionHost';
export type { SharedTransitionHostProps } from './SharedTransitionHost';

// =============================================================================
// Hooks
// =============================================================================

export { useSharedTransition } from './useSharedTransition';

// =============================================================================
// Types
// =============================================================================

export type {
  MeasuredFrame,
  SnapshotResult,
  SharedElementId,
  SharedElementProps,
  SharedTransitionAnimation,
  SharedTransitionConfig,
  SharedTransitionConfigInput,
  SharedTransitionContentScale,
  SharedTransitionEasing,
  SharedTransitionSnapshot,
  SharedTransitionSpringConfig,
} from './types';

export { DEFAULT_TRANSITION_CONFIG, resolveTransitionConfig } from './types';

// =============================================================================
// Advanced — registry & native primitives
// =============================================================================

export { SharedElementRegistry } from './SharedElementRegistry';
export type { RegistryEvent } from './SharedElementRegistry';

export {
  isNativeModuleAvailable,
  measureNode,
  captureSnapshot,
  setNodeHidden,
  cleanup,
} from './native/NativeModule';
