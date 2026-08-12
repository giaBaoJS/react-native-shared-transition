/**
 * Theme access.
 *
 * Dark-first: an unknown/unset system scheme resolves to the dark theme, which
 * is the one the app was designed against.
 */

import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { darkTheme, lightTheme } from './tokens';
import type { Theme } from './tokens';

export * from './tokens';

/** The active theme for the current system appearance. */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'light' ? lightTheme : darkTheme;
}

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

/**
 * Build a themed stylesheet once per theme rather than on every render.
 *
 * `factory` must be a stable reference — declare it at module scope, not inline
 * in the component, or the memo will miss on every render.
 *
 * ```ts
 * const createStyles = (t: Theme) => ({ root: { backgroundColor: t.color.canvas } });
 * // inside the component:
 * const styles = useThemedStyles(createStyles);
 * ```
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [factory, theme]);
}
