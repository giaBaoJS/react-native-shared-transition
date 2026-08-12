/**
 * Type definitions for the example app.
 */

import type { ImageSourcePropType } from 'react-native';

export interface Destination {
  /** Stable key — also used to build the shared element ids. */
  id: string;
  /** Editorial title shown on the card and as the detail headline. */
  title: string;
  /** Descriptive place-type, e.g. "Alpine ridgeline". Not a geographic claim. */
  region: string;
  /** Light/time-of-day the frame was made in. */
  hour: string;
  /** One-line hook shown under the title on the card. */
  tagline: string;
  /** Long-form copy for the detail screen. */
  body: string[];
  /** Dominant colour of the photograph, used for small accents. */
  swatch: string;
  photo: ImageSourcePropType;
}
