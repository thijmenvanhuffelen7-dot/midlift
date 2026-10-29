// Pure helpers for records, charts and calendars. No React Native here, so they can be tested.

export type SetLike = { exerciseId: string; weight: number; reps: number; warmup?: boolean };
export type SessionLike = { date: string; sets: SetLike[] };

/** m:ss, e.g. 84 → "1:24". */
export function clock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Heaviest working-set weight ever logged for an exercise (0 when none). */
export function bestWeight(sessions: SessionLike[], exerciseId: string): number {
  let best = 0;
  for (const s of sessions)
    for (const set of s.sets) if (set.exerciseId === exerciseId && !set.warmup && set.weight > best) best = set.weight;
  return best;
}

/** A record needs history: the first time you log an exercise is not a record. */
export function isNewRecord(previousBest: number, weight: number): boolean {
  return previousBest > 0 && weight > previousBest;
}

/** Total kg moved in working sets (weight × reps). */
export function volume(sets: SetLike[]): number {
  return sets.reduce((sum, s) => (s.warmup ? sum : sum + s.weight * s.reps), 0);
}

export type Point = { date: string; value: number };

/** One point per session for an exercise, oldest first. */
export function exerciseSeries(sessions: SessionLike[], exerciseId: string, metric: 'heaviest' | 'volume'): Point[] {
  const points: Point[] = [];
  for (const s of sessions) {
    const sets = s.sets.filter((x) => x.exerciseId === exerciseId && !x.warmup);
    if (sets.length === 0) continue;
    const value = metric === 'heaviest' ? Math.max(...sets.map((x) => x.weight)) : volume(sets);
    points.push({ date: s.date, value });
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}

export type LiftRecord = { exerciseId: string; weight: number; reps: number; date: string };

/** Heaviest set per exercise, with the date it was first lifted. Newest records first. */
export function records(sessions: SessionLike[]): LiftRecord[] {
  const best = new Map<string, LiftRecord>();
  const chronological = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  for (const s of chronological)
    for (const set of s.sets) {
      if (set.warmup || set.weight <= 0) continue;
      const cur = best.get(set.exerciseId);
      if (!cur || set.weight > cur.weight || (set.weight === cur.weight && set.reps > cur.reps))
        best.set(set.exerciseId, { exerciseId: set.exerciseId, weight: set.weight, reps: set.reps, date: s.date });
    }
  return [...best.values()].sort((a, b) => b.date.localeCompare(a.date));
}

/** Days of a month laid out Monday-first; null pads the first week. month is 0-based. */
export function monthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  return [...Array.from({ length: lead }, () => null), ...Array.from({ length: days }, (_, i) => i + 1)];
}
