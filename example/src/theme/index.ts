/**
 * Theme access.
 *
 * Dark-first: an unknown/unset system scheme resolves to the dark theme, which
 * is the one the app was designed against.
 *
 * Screens keep their static rules in a module-level `StyleSheet.create` and pull
 * only the theme-dependent values (colours, radii) from `useTheme()` at the call
 * site, so nothing is rebuilt per render.
 */

import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme } from './tokens';
import type { Theme } from './tokens';

export * from './tokens';

/** The active theme for the current system appearance. */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'light' ? lightTheme : darkTheme;
}
