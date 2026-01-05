import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

/**
 * Content scaling mode for transition overlay
 */
export type OverlayResizeMode = 'cover' | 'contain' | 'stretch';

/**
 * Props for TransitionOverlay native view
 *
 * This view displays the snapshot during a shared element transition.
 * Position/scale are controlled via Animated/Reanimated transforms.
 */
export interface TransitionOverlayProps extends HybridViewProps {
  /**
   * URI to the snapshot image
   * Can be file:// or data:// URI
   */
  snapshotUri: string;

  /**
   * Original snapshot width (for aspect ratio)
   */
  snapshotWidth: number;

  /**
   * Original snapshot height (for aspect ratio)
   */
  snapshotHeight: number;

  /**
   * How to scale the content
   * @default 'stretch'
   */
  resizeMode: OverlayResizeMode;

  /**
   * Opacity of the overlay (0-1)
   * Used for fade animations
   * @default 1
   */
  opacity: number;
}

/**
 * Methods for TransitionOverlay
 */
export interface TransitionOverlayMethods extends HybridViewMethods {
  /**
   * Fade out the overlay with native animation
   * @param duration - Animation duration in ms
   */
  fadeOut(duration: number): Promise<void>;

  /**
   * Update the snapshot URI (for cross-fade)
   * @param uri - New snapshot URI
   */
  updateSnapshot(uri: string): void;
}

/**
 * Native View for rendering transition overlays
 *
 * Features:
 * - Efficient image rendering from snapshot URI
 * - Native fade animation support
 * - Resize mode control
 *
 * Transform animations are controlled by Reanimated.
 */
export type TransitionOverlay = HybridView<
  TransitionOverlayProps,
  TransitionOverlayMethods
>;
