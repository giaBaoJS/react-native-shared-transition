/**
 * 🎨 Pawesome Palette - Cozy Corgi Cuteness Theme
 * Beautiful pastel colors for a delightful UI experience
 */

export const Colors = {
  // Primary Pastels
  cream: '#FFF8F0',
  butter: '#FFE5A0',
  peach: '#FFB380',
  coral: '#FFB3B3',
  rose: '#FFB3D1',
  lavender: '#D1B3FF',
  mint: '#B3E8D8',
  sky: '#B3D9FF',

  // Darker variants for gradients
  butterDark: '#FFD580',
  peachDark: '#FFA066',
  coralDark: '#FF9999',
  roseDark: '#FF99C2',
  lavenderDark: '#C299FF',
  mintDark: '#8DD9C4',
  skyDark: '#8AC2FF',

  // Neutrals
  text: {
    primary: '#5D4E37',
    secondary: '#8B7355',
    light: '#B8A082',
    white: '#FFFFFF',
  },

  // Backgrounds
  background: {
    primary: '#FFF8F0',
    secondary: '#FFFBF5',
    card: '#FFFFFF',
  },

  // Shadows
  shadow: 'rgba(139, 115, 85, 0.15)',
  shadowDark: 'rgba(93, 78, 55, 0.25)',
} as const;

// Gradient presets
export const Gradients = {
  sunset: [Colors.butter, Colors.peach, Colors.coral],
  candy: [Colors.rose, Colors.lavender],
  ocean: [Colors.mint, Colors.sky],
  warm: [Colors.butter, Colors.rose],
  cool: [Colors.lavender, Colors.mint],
  rainbow: [
    Colors.butter,
    Colors.peach,
    Colors.rose,
    Colors.lavender,
    Colors.mint,
  ],
} as const;

// Card gradient colors (for hero cards)
export const CardGradients = [
  [Colors.butter, Colors.peachDark],
  [Colors.peach, Colors.roseDark],
  [Colors.coral, Colors.lavenderDark],
  [Colors.rose, Colors.lavender],
  [Colors.lavender, Colors.mintDark],
  [Colors.mint, Colors.skyDark],
  [Colors.sky, Colors.lavenderDark],
  [Colors.butterDark, Colors.coralDark],
] as const;

// Typography
export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
} as const;

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Border Radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

// Shadows
export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation durations
export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;

export default {
  Colors,
  Gradients,
  CardGradients,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Animation,
};
