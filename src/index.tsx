import { getHostComponent } from 'react-native-nitro-modules';
const SharedTransitionConfig = require('../nitrogen/generated/shared/json/SharedTransitionConfig.json');
import type {
  SharedTransitionMethods,
  SharedTransitionProps,
} from './SharedTransition.nitro';

export const SharedTransitionView = getHostComponent<
  SharedTransitionProps,
  SharedTransitionMethods
>('SharedTransition', () => SharedTransitionConfig);
