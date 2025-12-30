// Public API exports
export { SharedElement } from './SharedElement';
export { useSharedTransition } from './useSharedTransition';

// Type exports
export type {
  SharedElementId,
  SharedElementProps,
  ElementLayout,
  SharedTransitionConfig,
  SharedTransitionResult,
  TransitionState,
} from './types';

// Native types (for advanced usage)
export type {
  NativeLayout,
  SnapshotData,
  TransitionConfig,
} from './specs/SharedTransitionModule.nitro';

// Native module utilities (for advanced usage)
export {
  isNativeModuleAvailable,
  captureSnapshot,
  measureLayout,
} from './native/NativeModule';
