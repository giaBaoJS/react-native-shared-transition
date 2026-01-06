/**
 * Navigation types
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Hero } from '../types';

export type RootStackParamList = {
  Home: undefined;
  Detail: { hero: Hero };
  Demo: { hero: Hero };
  Debug: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type DetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Detail'
>;
export type DemoScreenProps = NativeStackScreenProps<RootStackParamList, 'Demo'>;
export type DebugScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Debug'
>;
