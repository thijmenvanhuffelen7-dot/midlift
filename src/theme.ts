import { useColorScheme } from 'react-native';

// Logger look: plain grounds, grey filled cells, one blue for every action,
// green for completed sets, amber only for "adjusted for today".
const light = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  /** filled cells: inputs, chips, set rows, thumbnails */
  fill: '#F1F2F4',
  fillStrong: '#E4E6EA',
  /** selected segment, raised above the fill */
  segment: '#FFFFFF',
  line: '#E6E7EB',
  ink: '#0E0F12',
  muted: '#62666F',
  accent: '#1F64E6',
  accentInk: '#FFFFFF',
  accentSoft: '#E7EEFC',
  ok: '#15803D',
  okInk: '#FFFFFF',
  okSoft: '#E3F5E9',
  warn: '#9A5B00',
  warnSoft: '#FFF3DC',
  danger: '#C62828',
};

const dark: typeof light = {
  bg: '#0B0C0E',
  surface: '#16171A',
  fill: '#202227',
  fillStrong: '#2C2F35',
  segment: '#3A3D44',
  line: '#26282D',
  ink: '#F4F5F7',
  muted: '#A0A4AD',
  accent: '#4C8DFF',
  accentInk: '#06122B',
  accentSoft: '#15264A',
  ok: '#3DD47A',
  okInk: '#05230F',
  okSoft: '#0F2A1A',
  warn: '#F2B544',
  warnSoft: '#33260C',
  danger: '#FF6B6B',
};

export type Colors = typeof light;

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };
export const radius = { s: 8, m: 12, l: 16, pill: 999 };

/** Type scale after the iOS text styles; sizes scale with the system text size. */
export const type = {
  largeTitle: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 17 },
  subhead: { fontSize: 15 },
  footnote: { fontSize: 13 },
  caption: { fontSize: 12, fontWeight: '600' as const },
};
