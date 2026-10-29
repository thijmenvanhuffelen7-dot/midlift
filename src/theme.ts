import { useColorScheme } from 'react-native';

const light = {
  bg: '#F4F5F2',
  surface: '#FFFFFF',
  ink: '#16231E',
  muted: '#4E5B55',
  line: '#D9DDD8',
  accent: '#A3324F',
  accentInk: '#FFFFFF',
  accentSoft: '#F3E1E6',
  forest: '#1F3A30',
  forestInk: '#EEF2EE',
  ok: '#2F6B4A',
};

const dark: typeof light = {
  bg: '#111916',
  surface: '#18221E',
  ink: '#E8EEEA',
  muted: '#A3B0AA',
  line: '#2C3934',
  accent: '#E2728F',
  accentInk: '#1A0B10',
  accentSoft: '#3A1F27',
  forest: '#1D2E27',
  forestInk: '#E8EEEA',
  ok: '#7BC59C',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };
export const radius = { s: 8, m: 12, l: 16, pill: 999 };
export const type = {
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16 },
  small: { fontSize: 13 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
};
