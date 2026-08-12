/**
 * SegmentedControl
 *
 * A pill control with a thumb that springs between segments. Used to switch the
 * app-wide shared-transition config.
 */

import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '../theme';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.id === value)
  );

  // Inset the track so the thumb never touches the container's edge.
  const padding = 4;
  const segmentWidth =
    trackWidth > 0 ? (trackWidth - padding * 2) / options.length : 0;

  const offset = useDerivedValue(
    () => withSpring(selectedIndex * segmentWidth, theme.motion.press),
    [selectedIndex, segmentWidth]
  );

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const onLayout = useCallback(
    (width: number) => setTrackWidth(width),
    [setTrackWidth]
  );

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e) => onLayout(e.nativeEvent.layout.width)}
      style={[
        styles.track,
        {
          padding,
          backgroundColor: theme.color.surface,
          borderColor: theme.color.border,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              width: segmentWidth,
              left: padding,
              top: padding,
              bottom: padding,
              backgroundColor: theme.color.surfaceRaised,
              borderColor: theme.color.borderStrong,
              borderRadius: theme.radius.full,
            },
            theme.elevation.control,
            thumbStyle,
          ]}
        />
      ) : null}

      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.id)}
            style={styles.segment}
          >
            <Text
              style={[
                theme.type.callout,
                styles.label,
                {
                  color: active ? theme.color.accent : theme.color.textTertiary,
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  label: {
    textAlign: 'center',
  },
});

export default SegmentedControl;
