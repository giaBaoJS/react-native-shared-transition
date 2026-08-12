/**
 * Design tokens for the example app.
 *
 * Dark-first: the dark palette is the designed one and the light palette is a
 * considered inversion of it, not an afterthought. Both are the same shape, so
 * a component only ever reads `theme.color.*` and never branches on scheme.
 */

// =============================================================================
// Spacing — 4pt base, 8pt rhythm
// =============================================================================

export const space = {
  /** 2 — hairline nudges */
  xxs: 2,
  /** 4 */
  xs: 4,
  /** 8 */
  sm: 8,
  /** 12 */
  md: 12,
  /** 16 — default gutter */
  lg: 16,
  /** 20 */
  xl: 20,
  /** 24 — screen gutter */
  xxl: 24,
  /** 32 — section break */
  xxxl: 32,
  /** 48 — major section break */
  huge: 48,
  /** 64 */
  giant: 64,
} as const;

// =============================================================================
// Radii
// =============================================================================

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 999,
} as const;

// =============================================================================
// Typography — one scale, clear hierarchy, no ad-hoc font sizes in screens
// =============================================================================

export const type = {
  display: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -1.1,
  },
  title1: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  title2: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  title3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '400',
    letterSpacing: 0,
  },
  callout: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0,
  },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.3,
  },
} as const;

export type TypeToken = keyof typeof type;

// =============================================================================
// Motion
// =============================================================================

export const motion = {
  /** Card press-in / press-out. Snappy, no overshoot. */
  press: { damping: 22, stiffness: 420, mass: 0.6 },
  /** Entrance springs for staggered content. */
  entrance: { damping: 18, stiffness: 190, mass: 0.9 },
  /** Delay between staggered grid items, in ms. */
  stagger: 55,
} as const;

// =============================================================================
// Palettes
// =============================================================================

export interface ThemeColor {
  canvas: string;
  surface: string;
  surfaceRaised: string;
  glass: string;
  /**
   * Fill for a control that sits directly on a photograph. Identical in both
   * schemes on purpose: the backdrop is the image, not the canvas, so it must
   * stay legible over a bright sky and a dark forest alike.
   */
  controlOnImage: string;
  borderOnImage: string;
  border: string;
  borderStrong: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnImage: string;
  textOnAccent: string;

  accent: string;
  accentMuted: string;

  shadow: string;
  shadowOpacity: number;
  scrim: string;
}

const darkColor: ThemeColor = {
  /** Page background. */
  canvas: '#0B0B10',
  /** Cards, sheets, controls. */
  surface: '#15151D',
  /** A surface sitting on top of another surface. */
  surfaceRaised: '#1E1E28',
  /** Translucent fill for controls over imagery. */
  glass: 'rgba(20, 20, 28, 0.62)',
  controlOnImage: 'rgba(10, 10, 16, 0.46)',
  borderOnImage: 'rgba(255, 255, 255, 0.28)',
  /** Hairline separators and card outlines. */
  border: 'rgba(255, 255, 255, 0.09)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',

  textPrimary: '#F4F4F7',
  textSecondary: '#9E9EAC',
  textTertiary: '#6A6A78',
  /** Type that always sits on top of a photograph. */
  textOnImage: '#FFFFFF',
  textOnAccent: '#17130A',

  accent: '#E9A23B',
  accentMuted: 'rgba(233, 162, 59, 0.16)',

  shadow: '#000000',
  shadowOpacity: 0.55,
  /** Scrim colour laid over imagery so type stays legible. */
  scrim: '#07070B',
};

const lightColor: ThemeColor = {
  canvas: '#FBFAF8',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.74)',
  controlOnImage: 'rgba(10, 10, 16, 0.46)',
  borderOnImage: 'rgba(255, 255, 255, 0.28)',
  border: 'rgba(17, 17, 24, 0.10)',
  borderStrong: 'rgba(17, 17, 24, 0.18)',

  textPrimary: '#14141B',
  textSecondary: '#5C5C68',
  textTertiary: '#8B8B97',
  textOnImage: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  accent: '#B0700F',
  accentMuted: 'rgba(176, 112, 15, 0.12)',

  shadow: '#2A2118',
  shadowOpacity: 0.14,
  scrim: '#0A0A0F',
};

// =============================================================================
// Elevation — shadows are tuned per scheme (dark UIs need depth from contrast,
// not from a black drop shadow that is invisible on a black canvas)
// =============================================================================

function elevation(color: ThemeColor) {
  return {
    card: {
      shadowColor: color.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: color.shadowOpacity,
      shadowRadius: 24,
      elevation: 8,
    },
    control: {
      shadowColor: color.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: color.shadowOpacity * 0.7,
      shadowRadius: 10,
      elevation: 4,
    },
  } as const;
}

export interface Theme {
  scheme: 'dark' | 'light';
  color: ThemeColor;
  space: typeof space;
  radius: typeof radius;
  type: typeof type;
  motion: typeof motion;
  elevation: ReturnType<typeof elevation>;
}

export const darkTheme: Theme = {
  scheme: 'dark',
  color: darkColor,
  space,
  radius,
  type,
  motion,
  elevation: elevation(darkColor),
};

export const lightTheme: Theme = {
  scheme: 'light',
  color: lightColor,
  space,
  radius,
  type,
  motion,
  elevation: elevation(lightColor),
};
