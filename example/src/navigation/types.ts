/**
 * Navigation type definitions
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Hero } from '../types';

export type TransitionType = 'fade' | 'scale' | 'slide' | 'none';

export type RootStackParamList = {
  Home: undefined;
  Detail: {
    hero: Hero;
    index: number;
    transition?: TransitionType;
  };
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
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
