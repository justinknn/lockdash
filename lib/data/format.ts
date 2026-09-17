import { addDays, isSameDay, parseDay } from './dates';

/** True if the raw due string carries a time component (not just a date). */
function hasTime(raw: string): boolean {
  return raw.includes('T');
}

/**
 * Formats a due date/time the way the reference screenshots do:
 * "Today 10:00 AM", "Tomorrow", "6/13". Falls back gracefully for
 * date-only values (no time shown).
 */
export function formatDueLabel(raw: string, today: Date, locale: string): string {
  const day = parseDay(raw);
  const withTime = hasTime(raw) ? new Date(raw) : null;
  const timeLabel = withTime
    ? new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(withTime)
    : null;

  if (isSameDay(day, today)) {
    return timeLabel ? `Today ${timeLabel}` : 'Today';
  }
  if (isSameDay(day, addDays(today, 1))) {
    return timeLabel ? `Tomorrow ${timeLabel}` : 'Tomorrow';
  }
  const dateLabel = new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric' }).format(
    day,
  );
  return timeLabel ? `${dateLabel} ${timeLabel}` : dateLabel;
}
