---
name: Midlift
description: A Hevy-style workout logger, dark by default, that shows how today's workout adapts to her.
colors:
  bg: "#0A0A0B"
  surface: "#161618"
  surface2: "#232326"
  ink: "#F5F5F7"
  muted: "#A1A1A8"
  line: "#2E2E32"
  accent: "#4C8DFF"
  accent-ink: "#0A0A0B"
  done: "#34A86E"
  done-soft: "#102A1C"
  pr: "#E8B04A"
  pr-ink: "#0A0A0B"
  light-bg: "#F5F5F7"
  light-surface: "#FFFFFF"
  light-surface2: "#EDEDF0"
  light-ink: "#111113"
  light-muted: "#5C5C64"
  light-line: "#DADADF"
  light-accent: "#1F5FD6"
  light-done: "#1F7A4C"
  light-done-soft: "#E3F2E9"
  light-pr: "#8A5A00"
typography:
  display:
    fontFamily: "Bricolage Grotesque"
    fontSize: "40px"
    fontWeight: 800
    letterSpacing: "-0.5px"
  large-title:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "32px"
    fontWeight: 800
    letterSpacing: "-0.5px"
  title:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "22px"
    fontWeight: 700
  headline:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "17px"
    fontWeight: 600
  body:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "16px"
    fontWeight: 400
  label:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.5px"
rounded:
  s: "8px"
  m: "10px"
  l: "12px"
  sheet: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  s: "8px"
  m: "12px"
  l: "16px"
  xl: "20px"
  xxl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.m}"
    height: "52px"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    height: "52px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.l}"
    padding: "16px"
  field:
    backgroundColor: "{colors.surface2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    height: "48px"
  segmented-selected:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.s}"
    height: "48px"
  set-row-done:
    backgroundColor: "{colors.done-soft}"
    rounded: "{rounded.m}"
  pr-pill:
    backgroundColor: "{colors.pr}"
    textColor: "{colors.pr-ink}"
    rounded: "{rounded.pill}"
---

# Design System: Midlift

## Overview

The source of truth is the owner's screen design, `design/app-schermen.html` (14 screens, dark and light). Midlift is a serious Hevy-style logger: near-black by default, flat surfaces with 1px lines, one blue for actions, green for done sets and gold for records. Users can pick System, Dark or Light in Profile; dark is the default. Tokens live in `src/theme.ts` (`useColors()` reads the chosen theme) and components in `src/ui.tsx`.

## Colors

- **Blue** (`accent`) is for actions only: buttons, active tab, exercise names, trained days, the chart line, "Add set" and "Skip".
- **Green** (`done`, `done-soft`) is for completed sets only: the row tint and the outlined check box.
- **Gold** (`pr`) is for records and warm-up sets: the PR pill, the record toast border and the "W" set label.
- **Neutrals:** `bg` for the page, `surface` for cards and the tab bar, `surface2` for fields, segmented tracks and the rest bar, `line` for every 1px border, and `muted` for secondary text.

## Typography

The system font (SF Pro / Roboto) carries the UI. Screen titles are 32/800, section titles 22/700, row titles and values 17/600, and body and secondary text 16. Section labels are 13/600, uppercase, with 0.5 tracking (DEZE WEEK, VOLGENDE TRAINING). Bricolage Grotesque ExtraBold is used only for celebration: "Sterk gedaan." (40), "Training N" (28) and the `midlift` wordmark (15). Numbers use tabular numerals.

## Layout

There is a single column with 16px side padding and 20px between blocks on tab screens. Lists are rows with 1px top borders (48–60px high). Cards are `surface` with a 1px line, radius 12 and padding 16. The workout screen has its own sticky header (DUUR · VOLUME · SETS · Afronden) instead of a navigation bar.

## Elevation & Depth

The design is flat. Only floating layers get a shadow: the rest bar (0 10 30 rgba(0,0,0,.4)), the record toast and bottom sheets.

## Shapes

Shapes are rounded: 8 for segmented options, 10 for buttons, fields and set rows, 12 for cards and floating bars, 16 for the top corners of sheets, and pills for PR badges and meters. Week and calendar days are circles: filled blue when trained, with a 2px ring for today and a 2px line for empty days.

## Components

- **Set table:** columns SET (44) | VORIGE | KG (68) | HERH (68) | ✓ (48), all 48px high.
  - Tap the set number to make it a warm-up set (gold "W"). Tap VORIGE to copy last time's values.
  - A done row turns `done-soft` with a green outlined check.
  - "+ Set toevoegen" adds a set.
- **Adjusted strip:** a moon icon, "Aangepast: …" and a chevron. It expands to explain the adjustment.
- **Rest bar:** a floating `surface2` card with a progress line, RUST m:ss, −15 s, +15 s and Overslaan. Rest lasts 90 s.
- **Record toast:** a gold-bordered card with a PR pill and "Nieuw record". It shows for 4 s.
- **Bottom sheet:** a grab handle, a title, icon rows (56px) and an outlined Cancel button.
- **Segmented control:** a `surface2` track. The selected option sits on `bg` in bold ink, with optional icons.
- **Meters:** 10px pill bars. Protein is blue and calories are muted.
- **Icons:** Lucide (`lucide-react-native`), stroke 2.

## Do's and Don'ts

### Do:
- Match `design/app-schermen.html` when adding or changing a screen.
- Use `useColors()` and the components in `src/ui.tsx`. Keep all copy in the locale files.
- Test dark and light.

### Don't:
- Don't use blue, green or gold outside their roles.
- Don't use the display face outside celebration moments.
- Don't add drop shadows to cards or rows.
