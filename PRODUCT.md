# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

One shared Midlift design on iOS and Android (Expo / React Native), keeping each OS's native affordances (navigation, back gesture, safe areas, system type scaling).

## Users

Women of roughly 45–60 in (peri)menopause who are beginners at strength training. Little or no experience with weights, often unsure of themselves in a gym. They open the app at home or in the gym, just before or during a workout, phone in one hand, sometimes a dumbbell in the other.

## Product Purpose

Help these women build strength safely with three short (~25 min) workouts a week, at home or in the gym, and eat enough protein. Success: she keeps showing up week after week and feels stronger, without fear or guilt.

## Positioning

The workout adapts to how she feels today. A short check-in (energy, sleep, complaints in knee / back / shoulder / pelvic floor) changes the session before it starts: a set less when tired, lighter when very tired, safer swaps when something hurts. Next time it suggests a small weight increase when the last session went well.

## Operating Context

- Check-in right before training, then logging weight and reps per set with a 60 s rest timer between sets.
- Logging food against a daily protein and calorie goal; products from Open Food Facts; calories can be hidden.
- Progress: workouts this week (goal 3), totals, personal bests, history.
- Bilingual: English and Dutch; all copy lives in `src/locales/`.

## Capabilities and Constraints

- Expo SDK 58, Expo Router, TypeScript; runs in Expo Go now, development builds later.
- Data is local on the phone today; Supabase login and storage, RevenueCat subscriptions, intake quiz, barcode scanning and exercise videos are planned.
- Exercise videos do not exist yet: placeholders only.

## Brand Commitments

- Name: Midlift. No logo or binding colours exist.
- Look and feel: the owner's screen designs in `design/app-schermen.html` are binding (Hevy-style logger, dark by default). Never copy Hevy's logo or branding.

## Evidence on Hand

No testimonials, users, studies, or press. Do not invent any.

## Product Principles

1. Adapt to her, never the other way round: today's body sets today's workout.
2. Calm confidence over hype: no streak pressure, no weight-loss shaming, no shouting.
3. Plain words for beginners: every exercise and number is explained simply.
4. Short and doable beats complete.

## Accessibility & Inclusion

Audience aged 45–60: many use larger system text and reading glasses. Respect Dynamic Type / font scaling, generous touch targets (≥ 44 pt), strong contrast in light and dark.
