import { EXERCISES, PainArea, ProgramId, PROGRAMS, WorkoutDay } from '../data/program';
import type { Activity, FoodGoal } from './nutrition';

export type Experience = 'none' | 'some' | 'regular';
export type Location = 'home' | 'gym';
export type Equipment = 'dumbbells' | 'kettlebell' | 'band' | 'chair' | 'none';
export type Barrier = 'time' | 'howto' | 'injury' | 'motivation' | 'gym' | 'complaints';
export type TrainingGoal = 'strength' | 'fatloss' | 'energy' | 'bones';

/** Answers from the first-run quiz. */
export type Intake = {
  age: number;
  heightCm: number;
  weightKg: number;
  experience: Experience;
  location: Location;
  equipment: Equipment[];
  complaints: PainArea[];
  barriers: Barrier[];
  goal: TrainingGoal;
  activity: Activity;
};

/** Gym → gym plan; home with dumbbells or a kettlebell → weights plan; otherwise body weight. */
export function chooseProgram(i: Pick<Intake, 'location' | 'equipment'>): ProgramId {
  if (i.location === 'gym') return 'gym';
  return i.equipment.includes('dumbbells') || i.equipment.includes('kettlebell') ? 'home_dumbbells' : 'home_bodyweight';
}

export function foodGoalFor(goal: TrainingGoal): FoodGoal {
  return goal === 'fatloss' ? 'lose' : 'maintain';
}

/**
 * The programme with lasting complaints taken into account from day one:
 * exercises that load a sore area are swapped for their safer alternative.
 * At home without a band, band exercises become a body-weight exercise.
 */
export function buildPlan(program: ProgramId, complaints: PainArea[], equipment: Equipment[] = []): WorkoutDay[] {
  const noBand = program !== 'gym' && !equipment.includes('band');
  const safe = (id: string): string => {
    let cur = id;
    // A few rounds, in case a replacement loads another sore area.
    for (let round = 0; round < 3; round++) {
      const ex = EXERCISES[cur];
      const area = complaints.find((a) => ex.stresses.includes(a));
      const next = area ? ex.swapFor?.[area] : undefined;
      if (!next || !EXERCISES[next]) break;
      cur = next;
    }
    if (noBand && cur === 'band_pull_apart') cur = 'bird_dog';
    return cur;
  };
  return PROGRAMS[program].map((day) => ({ ...day, items: day.items.map((item) => ({ ...item, exerciseId: safe(item.exerciseId) })) }));
}
