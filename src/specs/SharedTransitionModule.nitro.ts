import type { HybridObject } from 'react-native-nitro-modules';

/**
 * A view frame measured in window coordinates (density-independent points).
 */
export interface MeasuredFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Result of a native snapshot capture.
 */
export interface SnapshotResult {
  /** `file://` URI of the captured PNG */
  uri: string;
  /** Logical width of the snapshot (points) */
  width: number;
  /** Logical height of the snapshot (points) */
  height: number;
}

/**
 * SharedTransition native module (Nitro HybridObject).
 *
 * Provides the three native primitives the JS transition coordinator needs:
 *  - precise, Fabric-safe view measurement in window coordinates
 *  - PNG snapshot capture of a view subtree
 *  - hiding/showing the original views while the overlay is in flight
 *
 * Views are looked up by the `nativeID` prop that `<SharedElement>` assigns.
 */
export interface SharedTransitionModule
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Measure a view's frame in window coordinates by its `nativeID`.
   * Rejects if the view cannot be found or is not attached to a window.
   */
  measureNode(nativeId: string): Promise<MeasuredFrame>;

  /**
   * Capture a PNG snapshot of the view with the given `nativeID`.
   * The file is written to the app's cache directory; call {@link cleanup}
   * to delete captured files.
   */
  captureSnapshot(nativeId: string): Promise<SnapshotResult>;

  /**
   * Hide or show the original view while a transition overlay is in flight.
   * Missing views are ignored (the view may already be unmounted).
   */
  setNodeHidden(nativeId: string, hidden: boolean): void;

  /**
   * Delete captured snapshot files and re-show any views hidden through
   * {@link setNodeHidden}.
   */
  cleanup(): void;
}
