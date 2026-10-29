import { createContext, createElement, ReactNode, useContext } from 'react';
import { useColorScheme } from 'react-native';

// Dark is the default look; light mirrors it. Blue = action, green = done,
// gold = records and warm-up sets.
const dark = {
  bg: '#0A0A0B',
  surface: '#161618',
  /** filled cells: inputs, segmented tracks, rest bar */
  surface2: '#232326',
  ink: '#F5F5F7',
  muted: '#A1A1A8',
  line: '#2E2E32',
  accent: '#4C8DFF',
  accentInk: '#0A0A0B',
  done: '#34A86E',
  doneSoft: '#102A1C',
  pr: '#E8B04A',
  prInk: '#0A0A0B',
  scrim: 'rgba(0,0,0,0.55)',
};

const light: typeof dark = {
  bg: '#F5F5F7',
  surface: '#FFFFFF',
  surface2: '#EDEDF0',
  ink: '#111113',
  muted: '#5C5C64',
  line: '#DADADF',
  accent: '#1F5FD6',
  accentInk: '#FFFFFF',
  done: '#1F7A4C',
  doneSoft: '#E3F2E9',
  pr: '#8A5A00',
  prInk: '#FFFFFF',
  scrim: 'rgba(0,0,0,0.4)',
};

export type Colors = typeof dark;
export type ThemePref = 'system' | 'dark' | 'light';

const ThemeCtx = createContext<{ colors: Colors; isDark: boolean }>({ colors: dark, isDark: true });

/** Resolves the user's preference (system / dark / light) once for the whole app. */
export function ThemeProvider({ pref, children }: { pref: ThemePref; children: ReactNode }) {
  const system = useColorScheme();
  const isDark = pref === 'dark' || (pref === 'system' && system !== 'light');
  return createElement(ThemeCtx.Provider, { value: { colors: isDark ? dark : light, isDark } }, children);
}

export function useColors(): Colors {
  return useContext(ThemeCtx).colors;
}

export function useIsDark(): boolean {
  return useContext(ThemeCtx).isDark;
}

/** Display face for celebratory moments (finish screen, wordmark). */
export const DISPLAY_FONT = 'BricolageGrotesque_800ExtraBold';

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24 };
export const radius = { s: 8, m: 10, l: 12, sheet: 16, pill: 999 };

export const type = {
  largeTitle: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const },
  /** row titles, button labels, values */
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 16 },
  /** small uppercase section label */
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  caption: { fontSize: 13 },
};
