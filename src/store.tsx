import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { deviceLanguage, Lang } from './i18n';
import type { ProgramId, WorkoutDay } from './data/program';
import { buildPlan, chooseProgram, foodGoalFor, Intake } from './logic/intake';
import type { Activity, FoodGoal } from './logic/nutrition';
import type { ThemePref } from './theme';

export type Profile = {
  lang: Lang;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: FoodGoal;
  hideCalories: boolean;
  theme: ThemePref;
  /** finished the first-run quiz */
  onboarded: boolean;
  program: ProgramId;
  intake?: Intake;
};

/** Subscription state; `test` marks purchases made in test mode (nothing charged). */
export type Premium = { active: boolean; plan?: 'monthly' | 'yearly'; since?: string; test?: boolean };

export type LoggedSet = { exerciseId: string; weight: number; reps: number; warmup?: boolean };
export type Session = {
  id: string;
  date: string;
  dayId: string;
  lighter: boolean;
  sets: LoggedSet[];
  /** workout length; missing on sessions saved before this was tracked */
  durationSec?: number;
  /** personal records set in this session */
  records?: { exerciseId: string; weight: number; reps: number }[];
  /** notes per exercise */
  notes?: Record<string, string>;
};
export type FoodEntry = { id: string; date: string; name: string; grams: number; kcal: number; protein: number };

type State = { profile: Profile; sessions: Session[]; food: FoodEntry[]; premium: Premium };

const STORAGE_KEY = 'midlift.v1';

const initialState: State = {
  profile: {
    lang: deviceLanguage(),
    age: 50,
    heightCm: 168,
    weightKg: 70,
    activity: 1,
    goal: 'maintain',
    hideCalories: false,
    theme: 'dark',
    onboarded: false,
    program: 'home_dumbbells',
  },
  sessions: [],
  food: [],
  premium: { active: false },
};

type Store = State & {
  ready: boolean;
  updateProfile: (patch: Partial<Profile>) => void;
  completeIntake: (intake: Intake) => void;
  setPremium: (p: Premium) => void;
  addSession: (s: Omit<Session, 'id'>) => string;
  addFood: (f: Omit<FoodEntry, 'id'>) => void;
  removeFood: (id: string) => void;
};

const Ctx = createContext<Store | null>(null);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Load saved data once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as Partial<State>;
          setState((s) => ({
            profile: { ...s.profile, ...saved.profile },
            sessions: saved.sessions ?? [],
            food: saved.food ?? [],
            premium: saved.premium ?? s.premium,
          }));
        }
      })
      .catch(() => {
        /* start with defaults when storage is unavailable */
      })
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  // Save after every change (once loaded).
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  // Keep the UI language in sync with the profile.
  useEffect(() => {
    if (i18n.language !== state.profile.lang) i18n.changeLanguage(state.profile.lang);
  }, [state.profile.lang]);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  }, []);
  const completeIntake = useCallback((intake: Intake) => {
    setState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        intake,
        age: intake.age,
        heightCm: intake.heightCm,
        weightKg: intake.weightKg,
        activity: intake.activity,
        goal: foodGoalFor(intake.goal),
        program: chooseProgram(intake),
        onboarded: true,
      },
    }));
  }, []);
  const setPremium = useCallback((premium: Premium) => {
    setState((s) => ({ ...s, premium }));
  }, []);
  const addSession = useCallback((sess: Omit<Session, 'id'>) => {
    const id = newId();
    setState((s) => ({ ...s, sessions: [{ ...sess, id }, ...s.sessions] }));
    return id;
  }, []);
  const addFood = useCallback((f: Omit<FoodEntry, 'id'>) => {
    setState((s) => ({ ...s, food: [{ ...f, id: newId() }, ...s.food] }));
  }, []);
  const removeFood = useCallback((id: string) => {
    setState((s) => ({ ...s, food: s.food.filter((f) => f.id !== id) }));
  }, []);

  const value = useMemo<Store>(
    () => ({ ...state, ready, updateProfile, completeIntake, setPremium, addSession, addFood, removeFood }),
    [state, ready, updateProfile, completeIntake, setPremium, addSession, addFood, removeFood],
  );

  // Always render the navigator (Expo Router needs it mounted); screens use `ready` where it matters.
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}

/** Working sets (no warm-ups) from the most recent session that included this exercise. */
export function lastSetsFor(sessions: Session[], exerciseId: string): LoggedSet[] | undefined {
  for (const s of sessions) {
    const sets = s.sets.filter((x) => x.exerciseId === exerciseId && !x.warmup);
    if (sets.length) return sets;
  }
  return undefined;
}

/** The user's three workouts: chosen programme with lasting complaints already swapped out. */
export function planFor(profile: Profile): WorkoutDay[] {
  return buildPlan(profile.program, profile.intake?.complaints ?? [], profile.intake?.equipment ?? []);
}
