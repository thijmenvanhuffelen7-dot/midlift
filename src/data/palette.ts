// Kleurtokens uit DESIGN.md. Puur bestand (geen React Native), zodat de tests het contrast kunnen controleren.

export const darkPalette = {
  bg: '#0E1311',
  surface: '#171D1A',
  surface2: '#212825',
  ink: '#EDF1EE',
  muted: '#9AA7A1',
  line: '#2A332F',
  accent: '#E2728F',
  accentInk: '#1A0B10',
  done: '#2F8F5B',
  doneSoft: '#16301F',
  pr: '#E8B04A',
  warn: '#E8B04A',
};

export type Palette = typeof darkPalette;

export const lightPalette: Palette = {
  bg: '#F4F5F2',
  surface: '#FFFFFF',
  surface2: '#EEF0EC',
  ink: '#16231E',
  muted: '#4E5B55',
  line: '#D9DDD8',
  accent: '#A3324F',
  accentInk: '#FFFFFF',
  done: '#2F6B4A',
  doneSoft: '#E2F0E7',
  pr: '#9A6A00',
  warn: '#8A5A00',
};

export type ThemePref = 'system' | 'dark' | 'light';
export type Scheme = 'dark' | 'light';

/** Welk thema we tonen. Bij "Systeem" volgen we de telefoon; weet die het niet, dan donker (de standaard). */
export function resolveScheme(pref: ThemePref, system: string | null | undefined): Scheme {
  if (pref === 'system') return system === 'light' ? 'light' : 'dark';
  return pref;
}

export function paletteFor(scheme: Scheme): Palette {
  return scheme === 'light' ? lightPalette : darkPalette;
}

/** WCAG-contrastverhouding tussen twee #RRGGBB-kleuren. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
