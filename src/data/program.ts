export type PainArea = 'knee' | 'back' | 'shoulder' | 'pelvic';
export const PAIN_AREAS: PainArea[] = ['knee', 'back', 'shoulder', 'pelvic'];

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
  farmers_carry: { id: 'farmers_carry', kind: 'time', loaded: true, stresses: ['back', 'pelvic'], swapFor: { back: 'dead_bug', pelvic: 'dead_bug' } },
  band_pull_apart: { id: 'band_pull_apart', kind: 'reps', loaded: false, stresses: [] },
  rdl: { id: 'rdl', kind: 'reps', loaded: true, stresses: ['back'], swapFor: { back: 'glute_bridge' } },
  incline_pushup: { id: 'incline_pushup', kind: 'reps', loaded: false, stresses: ['shoulder'], swapFor: { shoulder: 'bird_dog' } },
  dead_bug: { id: 'dead_bug', kind: 'reps', loaded: false, stresses: [] },
  bird_dog: { id: 'bird_dog', kind: 'reps', loaded: false, stresses: [] },
  // Gym machines
  leg_press: { id: 'leg_press', kind: 'reps', loaded: true, stresses: ['knee'], swapFor: { knee: 'hip_thrust' } },
  hip_thrust: { id: 'hip_thrust', kind: 'reps', loaded: true, stresses: [] },
  lat_pulldown: { id: 'lat_pulldown', kind: 'reps', loaded: true, stresses: ['shoulder'], swapFor: { shoulder: 'cable_row' } },
  cable_row: { id: 'cable_row', kind: 'reps', loaded: true, stresses: [] },
  chest_press: { id: 'chest_press', kind: 'reps', loaded: true, stresses: ['shoulder'], swapFor: { shoulder: 'bird_dog' } },
};

export type PlanItem = { exerciseId: string; sets: number; target: number };
export type WorkoutDay = { id: string; minutes: number; items: PlanItem[] };

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

/** Home without weights: body weight, a chair and optionally a band. */
export const STARTER_BODYWEIGHT: WorkoutDay[] = [
  {
    id: 'bw_lower',
    minutes: 20,
    items: [
      { exerciseId: 'box_squat', sets: 3, target: 12 },
      { exerciseId: 'glute_bridge', sets: 3, target: 15 },
      { exerciseId: 'single_leg_bridge', sets: 2, target: 10 },
    ],
  },
  {
    id: 'bw_upper',
    minutes: 20,
    items: [
      { exerciseId: 'incline_pushup', sets: 3, target: 8 },
      { exerciseId: 'band_pull_apart', sets: 3, target: 15 },
      { exerciseId: 'bird_dog', sets: 2, target: 10 },
    ],
  },
  {
    id: 'bw_full',
    minutes: 20,
    items: [
      { exerciseId: 'box_squat', sets: 3, target: 12 },
      { exerciseId: 'incline_pushup', sets: 3, target: 8 },
      { exerciseId: 'dead_bug', sets: 2, target: 10 },
    ],
  },
];

/** Gym: machines and dumbbells, three short sessions a week. */
export const STARTER_GYM: WorkoutDay[] = [
  {
    id: 'gym_lower',
    minutes: 30,
    items: [
      { exerciseId: 'leg_press', sets: 3, target: 10 },
      { exerciseId: 'hip_thrust', sets: 3, target: 10 },
      { exerciseId: 'rdl', sets: 3, target: 10 },
    ],
  },
  {
    id: 'gym_upper',
    minutes: 30,
    items: [
      { exerciseId: 'lat_pulldown', sets: 3, target: 10 },
      { exerciseId: 'chest_press', sets: 3, target: 10 },
      { exerciseId: 'cable_row', sets: 3, target: 10 },
    ],
  },
  {
    id: 'gym_full',
    minutes: 30,
    items: [
      { exerciseId: 'goblet_squat', sets: 3, target: 10 },
      { exerciseId: 'cable_row', sets: 3, target: 10 },
      { exerciseId: 'dead_bug', sets: 2, target: 10 },
    ],
  },
];

export type ProgramId = 'home_dumbbells' | 'home_bodyweight' | 'gym';

export const PROGRAMS: Record<ProgramId, WorkoutDay[]> = {
  home_dumbbells: STARTER_HOME,
  home_bodyweight: STARTER_BODYWEIGHT,
  gym: STARTER_GYM,
};

export const WORKOUTS_PER_WEEK = 3;
