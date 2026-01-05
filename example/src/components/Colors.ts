/**
 * Color constants for the example app
 * Vibrant color scheme inspired by One Punch Man
 */

export const Colors = {
  // Primary colors - Yellow/Gold theme
  primary: '#FFD700',
  primaryDark: '#FFA500',
  primaryLight: '#FFEC8B',

  // Secondary - Red accent
  secondary: '#FF4444',
  secondaryDark: '#CC0000',

  // Background colors
  back: '#FFFFFF',
  empty: '#F5F5F5',
  dark: '#1A1A2E',
  darker: '#16213E',

  // Card backgrounds
  cardBg: '#FFFFFF',
  cardOverlay: 'rgba(0, 0, 0, 0.6)',

  // Text colors
  text: '#1A1A2E',
  textLight: '#666666',
  textInverse: '#FFFFFF',
  textMuted: '#999999',

  // UI colors
  separator: '#E8E8E8',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Accent colors
  blue: '#0E4DA4',
  green: '#22C55E',
  red: '#EF4444',
  yellow: '#FFD700',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
};

export const Gradients = {
  primary: ['#FFD700', '#FFA500'],
  dark: ['transparent', 'rgba(0, 0, 0, 0.8)'],
  hero: ['rgba(26, 26, 46, 0)', 'rgba(26, 26, 46, 0.9)'],
};

export const Shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
};

export default Colors;
