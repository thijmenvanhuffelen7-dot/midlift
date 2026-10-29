/** Local date as YYYY-MM-DD. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Monday 00:00 of the week that contains d (local time). */
export function startOfWeek(d: Date = new Date()): Date {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const weekday = (s.getDay() + 6) % 7; // Monday = 0
  s.setDate(s.getDate() - weekday);
  return s;
}

export function isThisWeek(iso: string, now: Date = new Date()): boolean {
  const t = new Date(iso).getTime();
  const start = startOfWeek(now).getTime();
  return t >= start && t < start + 7 * 24 * 3600 * 1000;
}
