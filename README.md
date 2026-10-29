# Midlift

Krachttraining-app voor vrouwen in de overgang. Engels en Nederlands. Gebouwd met Expo (React Native).

## Wat er nu in zit (versie 0.1)

- **Vandaag:** je volgende training en hoeveel trainingen je deze week gedaan hebt (doel: 3).
- **Check-in:** energie, slaap en klachten. De training past zich aan: een set minder bij vermoeidheid, lichter bij heel moe, en oefeningen wisselen bij knie-, rug- of schouderklachten.
- **Training:** gewicht en herhalingen per set, afvinken, rusttimer van 60 seconden, en een voorstel om zwaarder te gaan als het vorige keer goed ging.
- **Voeding:** dagdoel voor eiwit en calorieën, zoeken in Open Food Facts, snel toevoegen, dagoverzicht. Calorieën kun je verbergen.
- **Voortgang:** trainingen deze week en in totaal, beste prestaties, geschiedenis.
- **Profiel:** taal, lichaamsgegevens, activiteit, voedingsdoel.

Alles wordt nu lokaal op de telefoon opgeslagen. Inloggen, Supabase en RevenueCat komen in de volgende stappen.

## De app op je telefoon draaien

1. Installeer **Node.js** (de LTS-versie) op je computer via nodejs.org.
2. Installeer de app **Expo Go** op je iPhone of Android-telefoon.
3. Pak deze map uit, open een terminal in de map en voer uit:

   ```
   npm install
   npx expo install --fix
   npx expo start
   ```

   `npx expo install --fix` zet alle Expo-pakketten op de juiste versie, ook als er inmiddels een nieuwere Expo-versie is. Wil je extra zekerheid, draai dan ook `npx expo-doctor`: dat meldt problemen en hoe je ze oplost.
4. Scan de QR-code met je telefoon (iPhone: met de camera; Android: in Expo Go). De app opent.

Zorg dat je computer en telefoon op hetzelfde wifi-netwerk zitten. Lukt dat niet, gebruik dan `npx expo start --tunnel`.

## Als er iets misgaat

- **Foutmelding bij `npm install` of `npx expo start`:** kopieer de hele melding en plak hem in je gesprek met Claude.
- **Rood scherm in de app:** maak een screenshot of kopieer de bovenste regels van de melding.
- **QR-code werkt niet:** gebruik `npx expo start --tunnel`.

## Testen

`npm test` controleert de belangrijkste regels van de app: het aanpassen van de training na de check-in, het gewichtsvoorstel, de voedingsdoelen en de datums.

## Mappen

- `app/` – de schermen (Expo Router: elk bestand is een scherm)
- `src/data/` – oefeningen, programma's en de Open Food Facts-koppeling
- `src/logic/` – de regels: training aanpassen, voedingsdoelen, datums
- `src/locales/` – alle teksten in het Engels (`en.json`) en Nederlands (`nl.json`)
- `src/store.tsx` – opslag van profiel, trainingen en voeding
- `src/ui.tsx` en `src/theme.ts` – knoppen, kaarten, kleuren
- `tests/` – tests voor de regels in `src/logic/`

## Aanpassen

- **App-naam en bundle-ID:** in `app.json` (`name`, `ios.bundleIdentifier`, `android.package`). Vervang `com.yourname` door iets van jezelf, bijvoorbeeld je domeinnaam achterstevoren.
- **E-mailadres voor Open Food Facts:** in `src/data/openFoodFacts.ts`.
- **Oefeningen en schema's:** in `src/data/program.ts`. Nieuwe oefening? Voeg ook de naam toe in beide taalbestanden onder `ex`.

## Volgende stappen

1. Oefenvideo's toevoegen.
2. Intake-quiz bij de eerste keer openen.
3. Barcode scannen (expo-camera).
4. Inloggen en opslaan in Supabase (EU).
5. Abonnementen met RevenueCat. Let op: RevenueCat werkt niet in Expo Go; daarvoor maak je een *development build* met EAS.
6. App-icoon en splash screen.
