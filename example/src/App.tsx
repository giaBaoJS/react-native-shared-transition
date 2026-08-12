/**
 * react-native-shared-transition — example app
 *
 * A photo gallery whose cards fly into a full-bleed detail screen. The active
 * transition config is chosen on the gallery and handed to
 * `<SharedTransitionHost config>`, which is the library's app-wide default.
 */

import { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import type { Theme as NavigationTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SharedTransitionHost } from 'react-native-shared-transition';

import { RootNavigator } from './navigation/RootNavigator';
import { useTheme } from './theme';
import { TransitionVariantProvider } from './transition/variants';

function useNavigationTheme(): NavigationTheme {
  const theme = useTheme();
  return {
    dark: theme.scheme === 'dark',
    colors: {
      primary: theme.color.accent,
      background: theme.color.canvas,
      card: theme.color.surface,
      text: theme.color.textPrimary,
      border: theme.color.border,
      notification: theme.color.accent,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '600' },
      heavy: { fontFamily: 'System', fontWeight: '700' },
    },
  };
}

export default function App() {
  const theme = useTheme();
  const navigationTheme = useNavigationTheme();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // The overlay is positioned in window coordinates, so on Android the RN
    // root must span the window too — otherwise every overlay is offset down
    // by the status bar height.
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }, []);

  return (
    <GestureHandlerRootView
      style={[styles.root, { backgroundColor: theme.color.canvas }]}
    >
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme.scheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <TransitionVariantProvider>
          {(config) => (
            <SharedTransitionHost config={config}>
              <NavigationContainer theme={navigationTheme}>
                <RootNavigator />
              </NavigationContainer>
            </SharedTransitionHost>
          )}
        </TransitionVariantProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
