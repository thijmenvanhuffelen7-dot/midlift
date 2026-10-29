export type PainArea = 'knee' | 'back' | 'shoulder';

export type Exercise = {
  id: string;
  /** reps = count repetitions, time = seconds */
  kind: 'reps' | 'time';
  /** true when the exercise uses weights you log in kg */
  loaded: boolean;
  /** body areas this exercise can irritate */
  stresses: PainArea[];
  /** exercise to use instead when that area hurts */
  swapFor?: Partial<Record<PainArea, string>>;
  /** gentler variant shown as a hint */
  easier?: string;
};

export const EXERCISES: Record<string, Exercise> = {
  goblet_squat: { id: 'goblet_squat', kind: 'reps', loaded: true, stresses: ['knee'], swapFor: { knee: 'box_squat' }, easier: 'box_squat' },
  box_squat: { id: 'box_squat', kind: 'reps', loaded: true, stresses: [] },
  glute_bridge: { id: 'glute_bridge', kind: 'reps', loaded: true, stresses: [] },
  step_up: { id: 'step_up', kind: 'reps', loaded: true, stresses: ['knee'], swapFor: { knee: 'single_leg_bridge' } },
  single_leg_bridge: { id: 'single_leg_bridge', kind: 'reps', loaded: false, stresses: [] },
  db_row: { id: 'db_row', kind: 'reps', loaded: true, stresses: ['back'], swapFor: { back: 'band_pull_apart' } },
  shoulder_press: { id: 'shoulder_press', kind: 'reps', loaded: true, stresses: ['shoulder'], swapFor: { shoulder: 'band_pull_apart' } },
  farmers_carry: { id: 'farmers_carry', kind: 'time', loaded: true, stresses: ['back'], swapFor: { back: 'dead_bug' } },
  band_pull_apart: { id: 'band_pull_apart', kind: 'reps', loaded: false, stresses: [] },
  rdl: { id: 'rdl', kind: 'reps', loaded: true, stresses: ['back'], swapFor: { back: 'glute_bridge' } },
  incline_pushup: { id: 'incline_pushup', kind: 'reps', loaded: false, stresses: ['shoulder'], swapFor: { shoulder: 'bird_dog' } },
  dead_bug: { id: 'dead_bug', kind: 'reps', loaded: false, stresses: [] },
  bird_dog: { id: 'bird_dog', kind: 'reps', loaded: false, stresses: [] },
};

export type PlanItem = { exerciseId: string; sets: number; target: number };
export type WorkoutDay = { id: 'legs' | 'pull' | 'full'; minutes: number; items: PlanItem[] };

/** Starter programme for home: three short workouts a week with dumbbells. */
export const STARTER_HOME: WorkoutDay[] = [
  {
    id: 'legs',
    minutes: 25,
    items: [
      { exerciseId: 'goblet_squat', sets: 3, target: 10 },
      { exerciseId: 'glute_bridge', sets: 3, target: 12 },
      { exerciseId: 'step_up', sets: 2, target: 8 },
    ],
  },
  {
    id: 'pull',
    minutes: 25,
    items: [
      { exerciseId: 'db_row', sets: 3, target: 10 },
      { exerciseId: 'shoulder_press', sets: 3, target: 8 },
      { exerciseId: 'farmers_carry', sets: 3, target: 30 },
    ],
  },
  {
    id: 'full',
    minutes: 25,
    items: [
      { exerciseId: 'rdl', sets: 3, target: 10 },
      { exerciseId: 'incline_pushup', sets: 3, target: 8 },
      { exerciseId: 'dead_bug', sets: 2, target: 10 },
    ],
  },
];

export const WORKOUTS_PER_WEEK = 3;
