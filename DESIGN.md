---
name: Midlift
description: A clean workout logger in the Hevy mould that shows how today's workout adapts to her.
colors:
  bg: "#FFFFFF"
  surface: "#FFFFFF"
  fill: "#F1F2F4"
  fill-strong: "#E4E6EA"
  segment: "#FFFFFF"
  line: "#E6E7EB"
  ink: "#0E0F12"
  muted: "#62666F"
  accent: "#1F64E6"
  accent-ink: "#FFFFFF"
  accent-soft: "#E7EEFC"
  ok: "#15803D"
  ok-soft: "#E3F5E9"
  warn: "#9A5B00"
  warn-soft: "#FFF3DC"
  danger: "#C62828"
  dark-bg: "#0B0C0E"
  dark-surface: "#16171A"
  dark-fill: "#202227"
  dark-segment: "#3A3D44"
  dark-line: "#26282D"
  dark-ink: "#F4F5F7"
  dark-muted: "#A0A4AD"
  dark-accent: "#4C8DFF"
  dark-ok: "#3DD47A"
  dark-warn: "#F2B544"
typography:
  large-title:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "32px"
    fontWeight: 800
    letterSpacing: "-0.6px"
  title:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "22px"
    fontWeight: 700
    letterSpacing: "-0.3px"
  headline:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "17px"
    fontWeight: 600
  body:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "23px"
  subhead:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "20px"
  footnote:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "13px"
    fontWeight: 400
  caption:
    fontFamily: "System (SF Pro / Roboto)"
    fontSize: "12px"
    fontWeight: 600
rounded:
  s: "8px"
  m: "12px"
  l: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  s: "8px"
  m: "12px"
  l: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.m}"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    height: "52px"
  input:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.m}"
    height: "48px"
  chip:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.pill}"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.l}"
    padding: "16px"
  set-row-done:
    backgroundColor: "{colors.ok-soft}"
    rounded: "{rounded.s}"
    height: "48px"
---

# Design System: Midlift

## Overview

Midlift looks like a serious workout logger, in the mould of Hevy: plain white or near-black grounds, grey filled cells, hairlines, and one confident blue for every action. What no other logger shows is visible here: how today's workout was adapted after the check-in, always in amber. The audience is beginner women of 45–60, so everything is large, calm and plainly labelled. There is no wellness pastel and no hype.

Tokens live in `src/theme.ts` (`useColors()`, `space`, `radius`, `type`). Components live in `src/ui.tsx`. Light and dark both follow the system setting and are equally finished.

## Colors

### Primary
- **Action blue** (`accent`, dark `#4C8DFF`): primary buttons, selected chips, active tab, exercise names in the workout, trained days in the week strip, the duration value. Nothing decorative.

### Secondary
- **Done green** (`ok`, `ok-soft`): only completed sets (the row tint and the check button).
- **Adjusted amber** (`warn`, `warn-soft`): only "adjusted for today" (the check-in result, the workout strip, the "Lighter day" badge, the hint on Today).

### Neutral
- `bg` / `surface` for grounds, `fill` for every input, chip, thumbnail and inactive check, `line` for hairlines, `ink` for text and `muted` for secondary text (≥ 4.5:1 on `bg` and `fill`).

### Named Rules
- **One blue.** Every tappable primary thing is blue; blue is never decoration.
- **Amber means adapted.** Do not use amber for anything else, including trophies or warnings that are not about the adaptation.

## Typography

System font only (SF Pro on iOS, Roboto on Android), so text follows the user's text-size setting. The scale is `large-title` (screen titles), `title` (section headings), `headline` (row titles, values), `body`, `subhead` (secondary lines), `footnote` (labels, metadata) and `caption` (week-strip weekdays, table headers). Numbers that change or compare use tabular numerals.

### Named Rules
- **No eyebrows.** Nothing sits above a heading; dates and metadata go below it or in a trailing slot.

## Layout

Screens are a single column with 16px side padding and 24px between sections. A section is a `title` heading with optional trailing text on the same baseline, then its content. Lists are rows of at least 52px with hairline dividers; cards are used for one object (the next workout, one history entry, daily goals), never nested. A primary action that ends a flow is pinned in a footer bar (check-in).

## Elevation & Depth

Flat. Depth comes from the `fill` vs `bg` contrast and hairlines, not shadows. The only shadow is a 1px-offset, 4px-blur lift on the selected segment of a segmented control.

## Shapes

Rounded rectangles: 8px for set rows and small buttons, 12px for buttons, inputs and grouped lists, 16px for cards and callouts. Chips and badges are full pills. Thumbnails and week-strip days are circles.

## Components

### Buttons
Primary is a filled blue button, 52px high, bold 17px label, with an optional leading icon. Secondary is the same shape in `fill` with ink text. Plain is a blue text button. Compact buttons (36px) are used in headers and the rest bar.

### Chips
Pill chips that wrap, 44px high, in `fill`; the selected chip is blue with white text. Used for single choices on the check-in.

### Segmented / choice list
A segmented control (grey track, raised `segment` pill) only when every label fits on one line (Language). Longer options use the choice list: grouped rows in `fill` with a blue checkmark on the selected one.

### Cards / Containers
Cards are `surface` with a hairline border, 16px radius and 16px padding. Callouts (adjusted, no changes) are soft-tinted blocks without a border.

### Inputs / Fields
Filled `fill` fields with no border, 48px minimum height, a footnote label above, an optional leading icon, and a blue caret.

### Navigation
A native tab bar with four tabs (Today, Food, Progress, Profile), using Ionicons outline icons that switch to filled when active. Stack screens use the native header, and check-in is a modal.

### Set table (signature)
SET / PREVIOUS / KG / REPS / ✓ columns. Inputs are centred filled cells. Ticking a set turns the whole row `ok-soft` with a green check, gives a light haptic tick, and starts the rest bar (time, a progress line, −15 / +15, Skip). Above the first exercise sits the amber "Adjusted for today" strip when the check-in changed anything.

## Do's and Don'ts

### Do:
- Use the components in `src/ui.tsx` and the colours from `useColors()`; no raw hex in screens.
- Use Ionicons from `@expo/vector-icons` for every icon.
- Keep touch targets ≥ 44pt, and test both light and dark.
- Keep all copy in `src/locales/en.json` and `nl.json`.

### Don't:
- Don't use unicode glyphs or emoji as icons.
- Don't add eyebrows or kickers above headings.
- Don't use amber or green for anything other than adapted and done.
- Don't nest cards or wrap long labels in a segmented control.
