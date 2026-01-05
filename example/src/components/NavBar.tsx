/**
 * Navigation bar component
 */

import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { Colors } from './Colors';

interface NavBarProps {
  title?: string;
  back?: 'back' | 'close' | 'none';
  onBack?: () => void;
  light?: boolean;
  style?: any;
}

export function NavBar({
  title,
  back = 'none',
  onBack,
  light = false,
  style,
}: NavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 8 },
        light && styles.containerLight,
        style,
      ]}
    >
      <StatusBar
        barStyle={light ? 'light-content' : 'dark-content'}
        animated
      />

      {back !== 'none' && onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={[styles.backText, light && styles.backTextLight]}>
            {back === 'close' ? '✕' : '←'}
          </Text>
        </TouchableOpacity>
      )}

      {title && (
        <Text
          xlarge
          style={[styles.title, light && styles.titleLight]}
        >
          {title}
        </Text>
      )}

      {/* Spacer for alignment */}
      {back !== 'none' && <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.back,
  },
  containerLight: {
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backText: {
    fontSize: 24,
    color: Colors.text,
  },
  backTextLight: {
    color: Colors.text,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  titleLight: {
    color: Colors.textInverse,
  },
  spacer: {
    width: 44,
    marginLeft: 12,
  },
});

export default NavBar;
