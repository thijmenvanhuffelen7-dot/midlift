import { EXERCISES, PainArea, PlanItem, WorkoutDay } from '../data/program';

export type Level = 0 | 1 | 2;
export type CheckIn = { energy: Level; sleep: Level; pain: PainArea | 'none' };

export type Change =
  | { type: 'fewerSets' }
  | { type: 'lighter' }
  | { type: 'swapped'; from: string; to: string };

export type AdaptedWorkout = { items: PlanItem[]; changes: Change[]; lighter: boolean };

/**
 * Adjusts today's workout to how the user feels.
 * - Low energy or poor sleep: one set less per exercise (never below 2).
 * - Low energy and poor sleep: also suggest lighter weights.
 * - Pain in an area: swap exercises that load that area.
 */
export function adaptWorkout(day: WorkoutDay, c: CheckIn): AdaptedWorkout {
  const changes: Change[] = [];
  const tired = c.energy === 0 || c.sleep === 0;
  const veryTired = c.energy === 0 && c.sleep === 0;

  let items = day.items.map((item) => ({ ...item }));

  if (tired) {
    let reduced = false;
    items = items.map((item) => {
      if (item.sets > 2) {
        reduced = true;
        return { ...item, sets: item.sets - 1 };
      }
      return item;
    });
    if (reduced) changes.push({ type: 'fewerSets' });
  }

  if (veryTired) changes.push({ type: 'lighter' });

  if (c.pain !== 'none') {
    const area = c.pain;
    items = items.map((item) => {
      const ex = EXERCISES[item.exerciseId];
      const replacement = ex?.stresses.includes(area) ? ex.swapFor?.[area] : undefined;
      if (replacement && EXERCISES[replacement]) {
        changes.push({ type: 'swapped', from: item.exerciseId, to: replacement });
        const fromTime = ex.kind === 'time';
        const toTime = EXERCISES[replacement].kind === 'time';
        // Timed → reps (or reps → timed) gets a sensible default; reps → reps keeps the target (min 10).
        const target = toTime ? 30 : fromTime ? 10 : Math.max(item.target, 10);
        return { ...item, exerciseId: replacement, target };
      }
      return item;
    });
  }

  return { items, changes, lighter: veryTired };
}

/**
 * Suggests the next weight when all sets of the last session reached the target.
 * Small steps: +1 kg under 10 kg, +2 kg from 10 kg.
 */
export function suggestWeight(
  last: { weight: number; reps: number }[] | undefined,
  target: number,
  lighterToday: boolean,
): number | undefined {
  if (!last || last.length === 0) return undefined;
  const top = Math.max(...last.map((s) => s.weight));
  if (top <= 0) return undefined;
  if (lighterToday) return Math.max(0, Math.round(top * 0.85));
  const allHit = last.every((s) => s.reps >= target);
  if (!allHit) return undefined;
  return top + (top < 10 ? 1 : 2);
}
