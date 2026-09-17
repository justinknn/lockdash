import type { ThemeName } from '../data/config';

export interface Theme {
  name: ThemeName;
  /** CSS gradient used when no background image is supplied. */
  backgroundGradient: string;
  surface: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  danger: string;
}

export const themes: Record<ThemeName, Theme> = {
  midnight: {
    name: 'midnight',
    backgroundGradient: 'linear-gradient(160deg, #0b1120 0%, #171f33 55%, #1f1530 100%)',
    surface: 'rgba(255,255,255,0.06)',
    surfaceBorder: 'rgba(255,255,255,0.10)',
    textPrimary: '#f5f6f8',
    textSecondary: '#c7cbd6',
    textMuted: '#8a90a3',
    accent: '#7c9bff',
    danger: '#ff6b6b',
  },
  graphite: {
    name: 'graphite',
    backgroundGradient: 'linear-gradient(160deg, #16181d 0%, #202329 55%, #1a1c22 100%)',
    surface: 'rgba(255,255,255,0.055)',
    surfaceBorder: 'rgba(255,255,255,0.09)',
    textPrimary: '#f2f2f0',
    textSecondary: '#c2c3c1',
    textMuted: '#84868a',
    accent: '#8fd6c1',
    danger: '#ff7a68',
  },
  ink: {
    name: 'ink',
    backgroundGradient: 'linear-gradient(160deg, #06070a 0%, #101116 60%, #06070a 100%)',
    surface: 'rgba(255,255,255,0.045)',
    surfaceBorder: 'rgba(255,255,255,0.08)',
    textPrimary: '#eef0f4',
    textSecondary: '#b7bac4',
    textMuted: '#767a87',
    accent: '#ffd166',
    danger: '#ff6b6b',
  },
};

/** Rotating palette used to color events/tasks that don't specify a color. */
const CATEGORY_PALETTE = [
  '#c084fc', // violet
  '#5eead4', // teal
  '#f2b25c', // amber
  '#7c9bff', // blue
  '#fb7185', // rose
  '#a3e635', // lime
] as const;

/** Deterministic color for a label, so the same title always gets the same hue. */
export function colorForLabel(label: string, override?: string): string {
  if (override) return override;
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length]!;
}

/** Fraction of the canvas height reserved for iOS' own clock/date overlay. */
export const SAFE_AREA_FRACTION = 0.34;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 40,
};

export const radius = {
  sm: 14,
  md: 22,
  lg: 30,
};
