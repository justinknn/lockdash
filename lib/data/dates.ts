/**
 * Small, dependency-free date helpers. Everything here works on plain
 * Date objects at UTC-midnight granularity — we only ever need day-level
 * precision for the calendar/heatmap layouts, so pulling in a date library
 * would be overkill.
 */

/** Parses "yyyy-mm-dd" (or a full ISO string) into a UTC-midnight Date. */
export function parseDay(input: string): Date {
  const datePart = input.split('T')[0]!;
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
}

export function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDayKey(a) === toDayKey(b);
}

/** Sunday of the week containing `date` (matches the reference screenshots). */
export function startOfWeekSunday(date: Date): Date {
  const jsDay = date.getUTCDay(); // 0 = Sunday
  return addDays(date, -jsDay);
}

/** Returns the 7 days (Sun..Sat) of the week containing `date`. */
export function weekDays(date: Date): Date[] {
  const start = startOfWeekSunday(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Builds a 6x7 month grid (Sun-first) for the month containing `date`,
 * padded with the trailing/leading days of the neighboring months.
 */
export function monthGrid(date: Date): Date[] {
  const firstOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const gridStart = startOfWeekSunday(firstOfMonth);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

/** Day-of-year progress, e.g. { percent: 55, daysLeft: 165 }. */
export function yearProgress(date: Date): { year: number; percent: number; daysLeft: number } {
  const year = date.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const startOfNextYear = new Date(Date.UTC(year + 1, 0, 1));
  const totalDays = Math.round((startOfNextYear.getTime() - startOfYear.getTime()) / 86_400_000);
  const elapsedDays = Math.round((date.getTime() - startOfYear.getTime()) / 86_400_000);
  const percent = Math.round((elapsedDays / totalDays) * 100);
  const daysLeft = totalDays - elapsedDays;
  return { year, percent, daysLeft };
}

const WEEKDAY_LABELS_SUNDAY_FIRST = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/** Sunday-first single-letter weekday labels, matching the mini-calendar header. */
export function weekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS_SUNDAY_FIRST;
}
