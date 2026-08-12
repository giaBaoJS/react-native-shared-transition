/**
 * Navigation type definitions.
 *
 * Route params carry only the destination id — the screen looks the record up
 * from `src/data/destinations.ts`. Keeping `require()`d image sources out of
 * navigation state keeps the params serializable.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Gallery: undefined;
  Detail: { id: string };
};

export type GalleryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Gallery'
>;

export type DetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Detail'
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
