/**
 * Custom Text component with predefined styles
 */

import { Text as RNText, StyleSheet } from 'react-native';
import type { TextStyle, StyleProp } from 'react-native';
import { Colors } from './Colors';

interface TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  // Size variants
  small?: boolean;
  large?: boolean;
  xlarge?: boolean;
  xxlarge?: boolean;
  // Color variants
  light?: boolean;
  muted?: boolean;
  // Other
  numberOfLines?: number;
}

export function Text({
  children,
  style,
  small,
  large,
  xlarge,
  xxlarge,
  light,
  muted,
  numberOfLines,
}: TextProps) {
  const textStyles: StyleProp<TextStyle>[] = [styles.base];

  // Size
  if (small) textStyles.push(styles.small);
  else if (large) textStyles.push(styles.large);
  else if (xlarge) textStyles.push(styles.xlarge);
  else if (xxlarge) textStyles.push(styles.xxlarge);

  // Color
  if (light) textStyles.push(styles.light);
  if (muted) textStyles.push(styles.muted);

  // Custom style
  if (style) textStyles.push(style);

  return (
    <RNText style={textStyles} numberOfLines={numberOfLines}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    color: Colors.text,
  },
  small: {
    fontSize: 14,
  },
  large: {
    fontSize: 18,
    fontWeight: '600',
  },
  xlarge: {
    fontSize: 22,
    fontWeight: '700',
  },
  xxlarge: {
    fontSize: 28,
    fontWeight: '800',
  },
  light: {
    color: Colors.textInverse,
  },
  muted: {
    color: Colors.textMuted,
  },
});

export default Text;
