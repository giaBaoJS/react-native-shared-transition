/**
 * PressableScale
 *
 * A Pressable with a spring scale + dim on press. The feedback runs entirely on
 * the UI thread so it stays responsive while the gallery is scrolling or a
 * shared element transition is in flight.
 */

import { useCallback } from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps {
  onPress?: () => void;
  /** Scale reached while held. */
  activeScale?: number;
  /** Opacity reached while held. */
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  children: ReactNode;
}

export function PressableScale({
  onPress,
  activeScale = 0.97,
  activeOpacity = 0.92,
  style,
  accessibilityLabel,
  accessibilityHint,
  children,
}: PressableScaleProps) {
  const pressed = useSharedValue(0);

  const onPressIn = useCallback(() => {
    pressed.value = withSpring(1, motion.press);
  }, [pressed]);

  const onPressOut = useCallback(() => {
    pressed.value = withSpring(0, motion.press);
  }, [pressed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - activeScale) }],
    opacity: withTiming(1 - pressed.value * (1 - activeOpacity), {
      duration: 90,
    }),
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

export default PressableScale;
