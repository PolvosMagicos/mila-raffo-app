import '@/global.css';
import { Platform } from 'react-native';

// ─── Brand palette (synced with ecommerce globals.css) ───────────────────────
export const Palette = {
  accent: '#EC7C43',
  accentHover: '#f77b3b',
  greenWsp: '#A6C357',
  white: '#ffffff',
  black: '#000000',
} as const;

// ─── Semantic tokens (light / dark) ──────────────────────────────────────────
export const Colors = {
  light: {
    background: '#ffffff',
    foreground: '#111827',
    muted: '#6b7280',
    border: '#e5e7eb',
    accent: Palette.accent,
    accentHover: Palette.accentHover,
    // aliases used by existing components
    text: '#111827',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    background: '#09090b',
    foreground: '#f4f4f5',
    muted: '#9ca3af',
    border: '#27272a',
    accent: Palette.accent,
    accentHover: Palette.accentHover,
    // aliases
    text: '#f4f4f5',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ─── Typography ──────────────────────────────────────────────────────────────
export const FontFamily = {
  body: 'Raleway_400Regular',
  bodyMedium: 'Raleway_500Medium',
  bodySemiBold: 'Raleway_600SemiBold',
  bodyBold: 'Raleway_700Bold',
  editorial: 'Cormorant_400Regular',
  editorialItalic: 'Cormorant_400Regular_Italic',
  editorialBold: 'Cormorant_700Bold',
  accent: 'Bitter_400Regular',
  accentBold: 'Bitter_700Bold',
} as const;

export type FontFamilyKey = keyof typeof FontFamily;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
  '4xl': 48,
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ─── Radius ──────────────────────────────────────────────────────────────────
export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// ─── System fonts (fallback) ──────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});
