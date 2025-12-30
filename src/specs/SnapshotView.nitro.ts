import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

/**
 * Content scaling mode for snapshot
 */
export type ResizeMode = 'cover' | 'contain' | 'stretch';

/**
 * Props for SnapshotView
 */
export interface SnapshotViewProps extends HybridViewProps {
  /**
   * URI to the snapshot image (file:// or data:// URI)
   */
  snapshotUri: string;

  /**
   * Original width of the snapshot
   */
  snapshotWidth: number;

  /**
   * Original height of the snapshot
   */
  snapshotHeight: number;

  /**
   * Content mode for the snapshot
   * @default 'cover'
   */
  resizeMode: ResizeMode;
}

/**
 * Methods for SnapshotView
 */
export interface SnapshotViewMethods extends HybridViewMethods {
  /**
   * Fade out and remove the snapshot view
   *
   * @param duration - Fade duration in milliseconds
   */
  fadeOut(duration: number): Promise<void>;
}

/**
 * Native View for rendering captured snapshots during transitions
 *
 * This view is used to display the captured snapshot of a SharedElement
 * during the transition animation. It provides:
 *
 * - Efficient image rendering from file URI
 * - Proper content scaling
 * - Native fade out animation
 *
 * The actual position/scale animation is controlled by Reanimated
 * through transform styles applied to this view's container.
 */
export type SnapshotView = HybridView<SnapshotViewProps, SnapshotViewMethods>;
