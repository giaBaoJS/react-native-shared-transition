/**
 * React Navigation Example for react-native-shared-transition
 *
 * This example demonstrates:
 * - SharedElement component for marking elements
 * - SharedElementTransition for rendering transitions
 * - useSharedTransitionValue hook for controlling animations
 */

import React from 'react';
import { StatusBar, Platform, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
// SharedTransitionOverlay is for demo purposes only - not needed for basic usage
// import { SharedTransitionOverlay } from './components/SharedTransitionOverlay';

if (Platform.OS === 'android') {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <View style={styles.container}>
            <RootNavigator />
            {/* 
              SharedTransitionOverlay was created for demo purposes only.
              It's NOT needed for basic SharedElement usage.
              The red square bug occurs because native measurement isn't fully working.
              
              For proper React Navigation integration, you would need to:
              1. Hook into navigation's transition lifecycle
              2. Properly time element measurements
              3. Hide source/destination elements during transition
              
              <SharedTransitionOverlay duration={400} debug={__DEV__} />
            */}
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
