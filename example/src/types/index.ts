/**
 * Type definitions for the example app
 */

import type { ImageSourcePropType } from 'react-native';

/**
 * Hero data type
 */
export interface Hero {
  id: string;
  name: string;
  photo: ImageSourcePropType;
  quote?: string;
  description?: string;
}

/**
 * Shared element configuration (for future use)
 */
export interface SharedElementConfig {
  id: string;
  otherId?: string;
  animation?: 'move' | 'fade' | 'fade-in' | 'fade-out';
  resize?: 'auto' | 'stretch' | 'clip' | 'none';
  align?: string;
  debug?: boolean;
}

export type SharedElementsConfig = (SharedElementConfig | string)[];
