# Midlift – notities voor Claude

Krachttraining-app voor vrouwen in de overgang (EN + NL). Expo SDK 58, Expo Router, TypeScript.
Zie README.md voor de mappenstructuur.

## Werkafspraken
- De eigenaar is beginner: leg uit in gewone taal (Nederlands).
- Werk één stap tegelijk; eindig elke stap met wat er gedaan is en hoe je het test, en wacht op akkoord.
- Na elke stap moeten `npm run typecheck` en `npm test` slagen; daarna een git-commit.
- Vraag eerst als iets een account, geld of een sleutel nodig heeft. Sleutels altijd via omgevingsvariabelen, nooit in de code.

## Conventies
- Alle teksten in `src/locales/en.json` én `src/locales/nl.json`; geen tekst hard in schermen.
- Regels (pure functies, zonder React Native) in `src/logic/` en `src/data/`, met tests in `tests/`.
  De tests draaien met `tsc` + Node's testrunner, dus wat getest wordt mag geen React Native importeren.
- UI-bouwstenen uit `src/ui.tsx`, kleuren via `useColors()` uit `src/theme.ts`.
- Expo-pakketten toevoegen met `npx expo install <pakket>` zodat de versie bij de SDK past.
