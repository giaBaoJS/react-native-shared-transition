/**
 * react-native-shared-transition
 *
 * Modern shared element transitions for React Native.
 * Built with New Architecture (Fabric) and Nitro Modules.
 *
 * API compatible with react-native-shared-element.
 */

// =============================================================================
// Main Components
// =============================================================================

export { SharedElement, nodeFromRef } from './SharedElement';
export { SharedElementTransition } from './SharedElementTransition';

// =============================================================================
// Hooks
// =============================================================================

export {
  useSharedTransition,
  useSharedTransitionValue,
} from './useSharedTransition';

// =============================================================================
// Registry
// =============================================================================

export { SharedElementRegistry } from './SharedElementRegistry';
export type {
  TransitionPair,
  RegistryChangeCallback,
} from './SharedElementRegistry';

// =============================================================================
// Types - Public API
// =============================================================================

export type {
  // Core types
  SharedElementId,
  SharedElementNode,
  SharedElementProps,

  // Configuration types
  SharedElementConfig,
  SharedElementsConfig,
  SharedElementsConfigInput,
  SharedElementStrictConfig,

  // Transition types
  TransitionState,
  UseSharedTransitionConfig,
  UseSharedTransitionResult,
} from './types';

// Re-export animation/resize/align types for convenience
export type {
  SharedElementAnimation,
  SharedElementResize,
  SharedElementAlign,
  SharedElementContentType,
  SharedElementLayout,
} from './specs/SharedTransitionModule.nitro';

// Helper functions
export {
  normalizeSharedElementConfig,
  normalizeSharedElementsConfig,
} from './types';

// =============================================================================
// Transition Component Types
// =============================================================================

export type {
  TransitionEndpoint,
  SharedElementTransitionProps,
  MeasureData,
} from './SharedElementTransition';

// =============================================================================
// Native Module Utilities (Advanced)
// =============================================================================

export {
  isNativeModuleAvailable,
  isUsingNitro,
  getModuleType,
  measureNode,
  captureSnapshot,
  prepareTransition,
  setNodeHidden,
  cleanup,
} from './native/NativeModule';

export type { NativeModuleType } from './native/NativeModule';
