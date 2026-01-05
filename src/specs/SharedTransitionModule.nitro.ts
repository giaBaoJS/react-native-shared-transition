import type { HybridObject } from 'react-native-nitro-modules';

/**
 * Resize behavior for shared element transitions
 * Based on react-native-shared-element API
 */
export type SharedElementResize = 'auto' | 'stretch' | 'clip' | 'none';

/**
 * Animation type for shared element transitions
 * Based on react-native-shared-element API
 */
export type SharedElementAnimation = 'move' | 'fade' | 'fade-in' | 'fade-out';

/**
 * Alignment for shared element transitions
 * Based on react-native-shared-element API
 */
export type SharedElementAlign =
  | 'auto'
  | 'left-top'
  | 'left-center'
  | 'left-bottom'
  | 'right-top'
  | 'right-center'
  | 'right-bottom'
  | 'center-top'
  | 'center-center'
  | 'center-bottom';

/**
 * Content type hint for optimization
 */
export type SharedElementContentType = 'auto' | 'image' | 'snapshot';

/**
 * Layout measurement returned from native
 * All values are in screen coordinates (px)
 */
export interface SharedElementLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Data returned when measuring a shared element node
 */
export interface SharedElementNodeData {
  /** Layout in screen coordinates */
  layout: SharedElementLayout;
  /** Content type detected */
  contentType: SharedElementContentType;
  /** Snapshot URI if captured */
  snapshotUri: string;
}

/**
 * Configuration for a transition
 */
export interface TransitionConfig {
  animation: SharedElementAnimation;
  resize: SharedElementResize;
  align: SharedElementAlign;
  /** Debug mode - renders overlay boxes */
  debug: boolean;
}

/**
 * Data for a prepared transition between two elements
 */
export interface PreparedTransitionData {
  startLayout: SharedElementLayout;
  endLayout: SharedElementLayout;
  startSnapshotUri: string;
  endSnapshotUri: string;
  startContentType: SharedElementContentType;
  endContentType: SharedElementContentType;
}

/**
 * Shared Transition Native Module (Nitro)
 *
 * Modern implementation using:
 * - Fabric-safe view lookup via nativeID
 * - CALayer (iOS) / View.draw (Android) for snapshots
 * - Screen-relative measurements
 *
 * Compatible with react-native-shared-element API patterns.
 */
export interface SharedTransitionModule
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Measure a view's layout by its nativeID
   * Returns layout in screen coordinates
   *
   * @param nativeId - The nativeID prop value
   */
  measureNode(nativeId: string): Promise<SharedElementNodeData>;

  /**
   * Capture a snapshot of a view
   * Returns URI to the captured image
   *
   * @param nativeId - The nativeID prop value
   */
  captureSnapshot(nativeId: string): Promise<string>;

  /**
   * Prepare a transition between two elements
   * Captures both snapshots and measures layouts
   *
   * @param startNodeId - Start element nativeID
   * @param endNodeId - End element nativeID
   * @param config - Transition configuration
   */
  prepareTransition(
    startNodeId: string,
    endNodeId: string,
    config: TransitionConfig
  ): Promise<PreparedTransitionData>;

  /**
   * Create a clone view for the transition overlay
   * Returns the native view tag
   *
   * @param nativeId - Element to clone
   */
  createCloneView(nativeId: string): Promise<number>;

  /**
   * Destroy a clone view
   *
   * @param viewTag - Native view tag from createCloneView
   */
  destroyCloneView(viewTag: number): void;

  /**
   * Hide/show the original element during transition
   *
   * @param nativeId - Element nativeID
   * @param hidden - Whether to hide
   */
  setNodeHidden(nativeId: string, hidden: boolean): void;

  /**
   * Clean up all cached resources
   */
  cleanup(): void;
}
