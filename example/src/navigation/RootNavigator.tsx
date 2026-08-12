import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GalleryScreen } from '../screens/GalleryScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { useTheme } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.color.canvas },
        // A cross-fade keeps the screens themselves out of the way so the
        // shared elements are what the eye follows.
        animation: 'fade',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}
