/**
 * Shared Element Transition Example App
 *
 * Demonstrates shared element transitions using react-native-shared-transition
 * library built with Nitro Modules and Fabric support.
 */

import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Router, Colors } from './components';
import { MainScreen } from './screens';

// Configure status bar for Android
if (Platform.OS === 'android') {
  StatusBar.setTranslucent(true);
  StatusBar.setBackgroundColor('transparent');
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <Router initialNode={<MainScreen />} />
        </View>
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
    backgroundColor: Colors.empty,
  },
});
