import type { HybridObject } from 'react-native-nitro-modules';

/**
 * Layout information returned from native measurement
 */
export interface NativeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number; // Screen-relative X
  pageY: number; // Screen-relative Y
}

/**
 * Snapshot data returned from capture
 */
export interface SnapshotData {
  uri: string; // File URI to snapshot image
  width: number;
  height: number;
}

/**
 * Configuration for native transition
 */
export interface TransitionConfig {
  sourceId: string;
  targetId: string;
  duration: number;
}

/**
 * Element data for transition (snapshot + layout)
 */
export interface TransitionElement {
  snapshot: SnapshotData;
  layout: NativeLayout;
}

/**
 * Prepared transition data with source and target
 */
export interface PreparedTransition {
  source: TransitionElement;
  target: TransitionElement;
}

/**
 * Shared Transition Native Module
 *
 * Provides Fabric-safe APIs for:
 * - View snapshot capture
 * - Precise layout measurement
 * - Native transition coordination
 *
 * Uses Nitro Modules for optimal performance.
 * Does NOT use deprecated APIs (UIManager, findNodeHandle).
 */
export interface SharedTransitionModule
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Capture a snapshot of a view by its nativeID
   *
   * @param nativeId - The nativeID prop value of the SharedElement
   * @returns Promise resolving to snapshot URI and dimensions
   */
  captureSnapshot(nativeId: string): Promise<SnapshotData>;

  /**
   * Measure a view's layout by its nativeID (Fabric-safe)
   *
   * @param nativeId - The nativeID prop value of the SharedElement
   * @returns Promise resolving to layout information
   */
  measureLayout(nativeId: string): Promise<NativeLayout>;

  /**
   * Register a shared element for tracking
   *
   * @param nativeId - The nativeID prop value
   * @param transitionId - The SharedElement id prop
   */
  registerElement(nativeId: string, transitionId: string): void;

  /**
   * Unregister a shared element
   *
   * @param nativeId - The nativeID prop value
   */
  unregisterElement(nativeId: string): void;

  /**
   * Prepare transition between two elements
   * Captures snapshots and calculates positions
   *
   * @param sourceNativeId - Source element nativeID
   * @param targetNativeId - Target element nativeID
   * @returns Promise with source and target snapshot data
   */
  prepareTransition(
    sourceNativeId: string,
    targetNativeId: string
  ): Promise<PreparedTransition>;

  /**
   * Clean up cached snapshots
   */
  cleanup(): void;
}
