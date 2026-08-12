/**
 * Type definitions for the example app
 */

import type { SharedTransitionConfigInput } from 'react-native-shared-transition';

export type Hero = {
  id: string;
  name: string;
  photo: any;
  quote?: string;
  description?: string;
  rank?: number;
  class?: 'S' | 'A' | 'B' | 'C';
  /** Per-hero transition variant, to showcase the config options. */
  transition?: SharedTransitionConfigInput;
  /** Human-readable label of the variant, shown on the detail screen. */
  transitionLabel?: string;
};
