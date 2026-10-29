export type Activity = 0 | 1 | 2;
export type FoodGoal = 'maintain' | 'lose';

const ACTIVITY_FACTOR: Record<Activity, number> = { 0: 1.35, 1: 1.5, 2: 1.7 };

/** Lowest daily calorie goal the app will ever suggest. */
export const CALORIE_FLOOR = 1500;

/**
 * Daily goals for women, based on Mifflin-St Jeor.
 * The app deliberately avoids aggressive deficits: "lose" is -300 kcal and never below the floor.
 * Protein: 1.4 g per kg body weight, a common recommendation for active adults who strength train.
 */
export function dailyGoals(p: { age: number; heightCm: number; weightKg: number; activity: Activity; goal: FoodGoal }) {
  const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age - 161;
  const maintenance = bmr * ACTIVITY_FACTOR[p.activity];
  const target = p.goal === 'lose' ? maintenance - 300 : maintenance;
  const calories = Math.max(CALORIE_FLOOR, Math.round(target / 10) * 10);
  const protein = Math.round((p.weightKg * 1.4) / 5) * 5;
  return { calories, protein };
}

/** Values for a portion, from values per 100 g. */
export function portion(per100: { kcal: number; protein: number }, grams: number) {
  return {
    kcal: Math.round((per100.kcal * grams) / 100),
    protein: Math.round(((per100.protein * grams) / 100) * 10) / 10,
  };
}
