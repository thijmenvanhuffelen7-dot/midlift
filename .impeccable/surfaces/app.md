---
version: 1
slug: "app"
primary_target: "app"
related_targets: []
---

# Surface brief: Midlift app (all tabs, check-in, workout)

Scope: the whole native app shell and its screens. Mode: Operate.
Audience/job: beginner women 45–60 checking in, logging sets, logging protein, glancing at progress. Constraint: Expo Go, system fonts (Dynamic Type), light + dark.
User-pinned direction: the owner's own screen designs in design/app-schermen.html (Hevy-style, dark default) are binding.

## Direction contract

THESIS: A serious, clean workout logger in the Hevy mould, where the one thing no logger has is visible: today's adjustments. Refuses the soft "wellness" pastel-card look.
OWN-WORLD: White / near-black grounds, cool grey filled cells instead of bordered inputs, hairline separators, one confident blue for every action, green for completed sets, amber only for "adjusted for today". System type, heavy large titles, tabular numerals, Ionicons outline/filled pairs.
STORY: She sees this week and her next workout, checks in, gets a workout already adapted, ticks sets like in Hevy, finishes, sees it in her history.
FIRST VIEWPORT: Today: large title + date, 7-day week strip with trained days filled blue, next-workout card with exercise rows (thumb, name, sets × reps) and a full-width blue Start button.
FORM: Canon (Hevy-style logger), user-pinned; seed: seed:48944e02ac33cbf1. Signature: the Hevy set table (SET / PREVIOUS / KG / REPS / ✓, row turns green when done) topped by an amber "Adjusted for today" strip.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
