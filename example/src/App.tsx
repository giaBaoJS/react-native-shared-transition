/**
 * 🚀 React Native Shared Transition - Example App
 *
 * A beautiful showcase demonstrating the power of
 * react-native-shared-transition library
 */

import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
import { Colors } from './theme';

// Android specific setup
if (Platform.OS === 'android') {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
}

export default function App() {
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: Colors.background.primary }}
    >
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <NavigationContainer
          theme={{
            dark: false,
            colors: {
              primary: Colors.lavender,
              background: Colors.background.primary,
              card: Colors.background.card,
              text: Colors.text.primary,
              border: Colors.butter,
              notification: Colors.coral,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '800' },
            },
          }}
        >
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
