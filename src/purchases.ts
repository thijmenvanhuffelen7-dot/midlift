// Subscriptions. One entitlement, "premium", unlocks the app.
//
// TEST MODE: until the App Store, Google Play and RevenueCat accounts exist, purchases are
// simulated: nothing is charged and premium is stored on the phone only. Swapping this
// file's internals for react-native-purchases (RevenueCat) is the only change the
// screens need; they talk to the functions below.

export const PURCHASES_TEST_MODE = true;

export const ENTITLEMENT = 'premium';
export const TRIAL_DAYS = 7;

export type PlanId = 'yearly' | 'monthly';

/** Prices in euros. With RevenueCat these come from the stores, in the user's own currency. */
export const PLANS: { id: PlanId; price: number; months: number }[] = [
  { id: 'yearly', price: 59.99, months: 12 },
  { id: 'monthly', price: 9.99, months: 1 },
];

export function formatPrice(amount: number, lang: string): string {
  return new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
}

/** Percentage saved by paying yearly instead of monthly, rounded to a whole number. */
export function yearlySaving(): number {
  const yearly = PLANS.find((p) => p.id === 'yearly')!;
  const monthly = PLANS.find((p) => p.id === 'monthly')!;
  return Math.round((1 - yearly.price / (monthly.price * 12)) * 100);
}

export type PurchaseResult = { ok: true; plan: PlanId } | { ok: false; cancelled?: boolean };

/** Starts the subscription (with its free trial). */
export async function purchase(plan: PlanId): Promise<PurchaseResult> {
  if (PURCHASES_TEST_MODE) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true, plan };
  }
  return { ok: false };
}

/** Looks for an earlier purchase on this store account. */
export async function restore(): Promise<{ active: boolean; plan?: PlanId }> {
  if (PURCHASES_TEST_MODE) {
    await new Promise((r) => setTimeout(r, 600));
    return { active: false };
  }
  return { active: false };
}
