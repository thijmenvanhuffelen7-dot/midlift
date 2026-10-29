import { useColorScheme } from 'react-native';
import { Palette, paletteFor, resolveScheme, Scheme } from './data/palette';
import { useStore } from './store';

export type Colors = Palette;
export type { ThemePref, Scheme } from './data/palette';

/** Donker of licht, volgens de keuze in Profiel (Systeem / Donker / Licht). Standaard donker. */
export function useScheme(): Scheme {
  const system = useColorScheme();
  const { profile } = useStore();
  return resolveScheme(profile.theme, system);
}

export function useColors(): Colors {
  return paletteFor(useScheme());
}

// 8-puntsraster; zijmarge is `l` (16).
export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };
// Kaarten 12, knoppen en velden 10, chips volledig rond.
export const radius = { card: 12, control: 10, pill: 999 };

/**
 * Typografieschaal uit DESIGN.md. Geen fontFamily: dat is het systeemfont (SF Pro / Roboto).
 * Geen vaste regelhoogtes, zodat tekst meegroeit met grote systeemtekst.
 */
export const type = {
  largeTitle: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const },
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  number: { fontSize: 17, fontWeight: '600' as const, fontVariant: ['tabular-nums' as const] },
  caption: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.5, textTransform: 'uppercase' as const },
};

/**
 * Bricolage Grotesque 800: alleen voor het logo, welkomstschermen en het afrondscherm.
 * TODO: na `npx expo install expo-font @expo-google-fonts/bricolage-grotesque` het lettertype laden
 * in app/_layout.tsx en hier `fontFamily: 'BricolageGrotesque_800ExtraBold'` toevoegen.
 * Tot die tijd is dit het systeemfont in 800, zodat er geen onbekend lettertype gevraagd wordt.
 */
export const brandFont = { fontWeight: '800' as const };
