import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

export interface SharedTransitionProps extends HybridViewProps {
  color: string;
}
export interface SharedTransitionMethods extends HybridViewMethods {}

export type SharedTransition = HybridView<
  SharedTransitionProps,
  SharedTransitionMethods
>;
