import { NitroModules, getHostComponent } from 'react-native-nitro-modules';
import type { SharedTransitionModule } from '../specs/SharedTransitionModule.nitro';
import type {
  SnapshotViewProps,
  SnapshotViewMethods,
} from '../specs/SnapshotView.nitro';

// Re-export types for external usage
export type {
  NativeLayout,
  SnapshotData,
  PreparedTransition,
  TransitionElement,
} from '../specs/SharedTransitionModule.nitro';

/**
 * Native module singleton
 *
 * Provides access to native snapshot capture and measurement APIs.
 * Uses Nitro Modules for Fabric-native performance.
 */
let _module: SharedTransitionModule | null = null;

/**
 * Get the native SharedTransition module
 *
 * Lazy initialization to avoid loading native code until needed.
 */
export function getNativeModule(): SharedTransitionModule {
  if (_module === null) {
    _module = NitroModules.createHybridObject<SharedTransitionModule>(
      'SharedTransitionModule'
    );
  }
  return _module;
}

/**
 * Check if native module is available
 *
 * Returns false in Jest tests or when native code isn't linked.
 */
export function isNativeModuleAvailable(): boolean {
  try {
    getNativeModule();
    return true;
  } catch {
    return false;
  }
}

/**
 * Native SnapshotView component
 *
 * Used internally to render captured snapshots during transitions.
 * Not exported publicly - use SharedElement instead.
 */
let _snapshotViewConfig: ReturnType<
  typeof import('react-native-nitro-modules').getHostComponent
> | null = null;

function getSnapshotViewConfig() {
  if (_snapshotViewConfig === null) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _snapshotViewConfig = require('../../nitrogen/generated/shared/json/SnapshotViewConfig.json');
  }
  return _snapshotViewConfig as ReturnType<
    typeof import('react-native-nitro-modules').getHostComponent
  >;
}

export const NativeSnapshotView = getHostComponent<
  SnapshotViewProps,
  SnapshotViewMethods
>('SnapshotView', () => getSnapshotViewConfig());

/**
 * Capture a snapshot of a shared element
 *
 * @param nativeId - The nativeID of the element to capture
 * @returns Promise with snapshot URI and dimensions
 */
export async function captureSnapshot(nativeId: string) {
  const module = getNativeModule();
  return module.captureSnapshot(nativeId);
}

/**
 * Measure a shared element's layout (Fabric-safe)
 *
 * @param nativeId - The nativeID of the element to measure
 * @returns Promise with layout information
 */
export async function measureLayout(nativeId: string) {
  const module = getNativeModule();
  return module.measureLayout(nativeId);
}

/**
 * Prepare a transition between two elements
 *
 * Captures snapshots and measures both elements.
 *
 * @param sourceNativeId - Source element nativeID
 * @param targetNativeId - Target element nativeID
 * @returns Promise with source and target snapshot/layout data
 */
export async function prepareTransition(
  sourceNativeId: string,
  targetNativeId: string
) {
  const module = getNativeModule();
  return module.prepareTransition(sourceNativeId, targetNativeId);
}

/**
 * Register a shared element for tracking
 *
 * @param nativeId - The nativeID of the element
 * @param transitionId - The SharedElement id prop
 */
export function registerElement(nativeId: string, transitionId: string) {
  const module = getNativeModule();
  module.registerElement(nativeId, transitionId);
}

/**
 * Unregister a shared element
 *
 * @param nativeId - The nativeID of the element
 */
export function unregisterElement(nativeId: string) {
  const module = getNativeModule();
  module.unregisterElement(nativeId);
}

/**
 * Clean up cached snapshots
 */
export function cleanup() {
  const module = getNativeModule();
  module.cleanup();
}
