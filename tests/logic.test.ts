// Run: npm test  (compiles the pure logic with tsc and runs it with Node's built-in test runner)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_HOME, EXERCISES } from '../src/data/program';
import { adaptWorkout, suggestWeight } from '../src/logic/adapt';
import { dailyGoals, portion, CALORIE_FLOOR } from '../src/logic/nutrition';
import { dayKey, isThisWeek, startOfWeek } from '../src/logic/dates';
import { contrast, darkPalette, lightPalette, resolveScheme } from '../src/data/palette';

const legs = STARTER_HOME.find((d) => d.id === 'legs')!;
const pull = STARTER_HOME.find((d) => d.id === 'pull')!;

test('every exercise in the programme exists, and every swap target exists', () => {
  for (const day of STARTER_HOME) {
    for (const item of day.items) assert.ok(EXERCISES[item.exerciseId], item.exerciseId);
  }
  for (const ex of Object.values(EXERCISES)) {
    for (const to of Object.values(ex.swapFor ?? {})) assert.ok(EXERCISES[to!], `${ex.id} -> ${to}`);
    if (ex.easier) assert.ok(EXERCISES[ex.easier], `${ex.id} easier`);
  }
});

test('feeling fine: no changes', () => {
  const r = adaptWorkout(legs, { energy: 1, sleep: 1, pain: 'none' });
  assert.deepEqual(r.changes, []);
  assert.deepEqual(r.items, legs.items);
  assert.equal(r.lighter, false);
});

test('low energy: one set less, never below 2', () => {
  const r = adaptWorkout(legs, { energy: 0, sleep: 2, pain: 'none' });
  assert.deepEqual(r.items.map((i) => i.sets), [2, 2, 2]);
  assert.deepEqual(r.changes, [{ type: 'fewerSets' }]);
  assert.equal(r.lighter, false);
});

test('low energy and poor sleep: fewer sets and lighter', () => {
  const r = adaptWorkout(legs, { energy: 0, sleep: 0, pain: 'none' });
  assert.equal(r.lighter, true);
  assert.ok(r.changes.some((c) => c.type === 'lighter'));
});

test('knee pain swaps squat and step-up', () => {
  const r = adaptWorkout(legs, { energy: 2, sleep: 2, pain: 'knee' });
  assert.deepEqual(r.items.map((i) => i.exerciseId), ['box_squat', 'glute_bridge', 'single_leg_bridge']);
  assert.equal(r.changes.filter((c) => c.type === 'swapped').length, 2);
});

test('back pain swaps the carry (a timed exercise) for a rep exercise with a rep target', () => {
  const r = adaptWorkout(pull, { energy: 1, sleep: 1, pain: 'back' });
  const swapped = r.items.find((i) => i.exerciseId === 'dead_bug');
  assert.ok(swapped);
  assert.equal(swapped!.target, 10); // 30 seconds of carrying becomes 10 reps, not 30 reps
  assert.ok(r.items.every((i) => !EXERCISES[i.exerciseId].stresses.includes('back')));
});

test('weight suggestion', () => {
  assert.equal(suggestWeight(undefined, 10, false), undefined);
  assert.equal(suggestWeight([{ weight: 8, reps: 10 }, { weight: 8, reps: 10 }], 10, false), 9);
  assert.equal(suggestWeight([{ weight: 12, reps: 10 }], 10, false), 14);
  assert.equal(suggestWeight([{ weight: 8, reps: 10 }, { weight: 8, reps: 7 }], 10, false), undefined);
  assert.equal(suggestWeight([{ weight: 10, reps: 10 }], 10, true), 9); // 85% rounded
  assert.equal(suggestWeight([{ weight: 0, reps: 12 }], 10, false), undefined);
});

test('nutrition goals are sensible and never below the floor', () => {
  const g = dailyGoals({ age: 50, heightCm: 168, weightKg: 70, activity: 1, goal: 'maintain' });
  assert.ok(g.calories > 1800 && g.calories < 2200, String(g.calories));
  assert.equal(g.protein, 100);
  const small = dailyGoals({ age: 60, heightCm: 150, weightKg: 45, activity: 0, goal: 'lose' });
  assert.equal(small.calories, CALORIE_FLOOR);
});

test('portion maths', () => {
  assert.deepEqual(portion({ kcal: 60, protein: 10 }, 150), { kcal: 90, protein: 15 });
  assert.deepEqual(portion({ kcal: 55, protein: 3.3 }, 125), { kcal: 69, protein: 4.1 });
});

test('dates: week starts on Monday', () => {
  const wed = new Date(2026, 9, 28, 15, 0); // Wed 28 Oct 2026
  const mon = startOfWeek(wed);
  assert.equal(dayKey(mon), '2026-10-26');
  assert.equal(isThisWeek(new Date(2026, 9, 26, 0, 1).toISOString(), wed), true);
  assert.equal(isThisWeek(new Date(2026, 9, 25, 23, 59).toISOString(), wed), false);
  const sun = new Date(2026, 10, 1, 12, 0); // Sun 1 Nov 2026
  assert.equal(dayKey(startOfWeek(sun)), '2026-10-26');
});

// --- Thema (DESIGN.md) ---

test('theme: dark is the default, "system" follows the phone and falls back to dark', () => {
  assert.equal(resolveScheme('dark', 'light'), 'dark');
  assert.equal(resolveScheme('light', 'dark'), 'light');
  assert.equal(resolveScheme('system', 'light'), 'light');
  assert.equal(resolveScheme('system', 'dark'), 'dark');
  assert.equal(resolveScheme('system', null), 'dark');
});

test('theme: text colours reach 4.5:1 on every background, in dark and light', () => {
  for (const [name, p] of [['dark', darkPalette], ['light', lightPalette]] as const) {
    for (const fg of ['ink', 'muted', 'accent'] as const) {
      for (const bg of ['bg', 'surface', 'surface2', 'doneSoft'] as const) {
        const r = contrast(p[fg], p[bg]);
        assert.ok(r >= 4.5, `${name}: ${fg} on ${bg} is ${r.toFixed(2)}`);
      }
    }
    assert.ok(contrast(p.accentInk, p.accent) >= 4.5, `${name}: accentInk on accent`);
    assert.ok(contrast(p.warn, p.surface2) >= 4.5, `${name}: warm-up label on a set row`);
    // Het vinkje is een icoon: 3:1 is genoeg.
    assert.ok(contrast(p.done, p.doneSoft) >= 3, `${name}: check on a done row`);
  }
});
