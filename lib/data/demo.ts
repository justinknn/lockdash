import { toDayKey, addDays, startOfWeekSunday } from './dates';
import type { LockdashConfig } from './config';

type DemoConfig = Pick<LockdashConfig, 'events' | 'tasks' | 'today'>;

function iso(date: Date, hour?: number, minute = 0): string {
  if (hour === undefined) return toDayKey(date);
  const withTime = new Date(date.getTime());
  withTime.setUTCHours(hour, minute, 0, 0);
  return withTime.toISOString();
}

/**
 * Sample data shown when a request carries no config at all. Mirrors the
 * kind of content shown in the product screenshots, but computed relative
 * to "now" so a fresh preview never looks stale or dated.
 */
export function buildDemoData(now: Date): DemoConfig {
  const weekStart = startOfWeekSunday(now);
  const day = (offset: number) => addDays(weekStart, offset);

  const events: DemoConfig['events'] = [
    { title: 'Conference', start: iso(day(0)), end: iso(day(2)) },
    { title: 'Run', start: iso(day(0)) },
    { title: 'Stand-up', start: iso(day(1)) },
    { title: 'Exam week', start: iso(day(3)), end: iso(day(5)) },
    { title: 'Summer camp', start: iso(day(2)) },
    { title: '1:1', start: iso(day(4)) },
    { title: 'PT', start: iso(day(6)) },
    { title: 'Swim', start: iso(day(5)) },
    { title: 'Mock exam', start: iso(day(6)) },
  ];

  const tasks: DemoConfig['tasks'] = [
    { title: 'Pay utility bill', due: iso(day(now.getUTCDay()), 10, 0), quadrant: 'do' },
    { title: 'Send client file', due: iso(now, 14, 0), quadrant: 'do' },
    { title: 'Fix sign-in bug', due: iso(addDays(now, 1), 9, 30), quadrant: 'do' },
    { title: 'Plan weekly meals', due: iso(addDays(now, 1)), quadrant: 'schedule' },
    { title: 'Practice Spanish', quadrant: 'schedule' },
    { title: 'Long workout', quadrant: 'schedule' },
    { title: 'Review budget', due: iso(now), quadrant: 'schedule' },
    { title: 'Book team room', due: iso(now, 18, 0), quadrant: 'delegate' },
    { title: 'Order supplies', due: iso(addDays(now, 1)), quadrant: 'delegate' },
    { title: 'Update tracker', due: iso(addDays(now, 2)), quadrant: 'delegate' },
    { title: 'Check delivery', quadrant: 'delegate' },
    { title: 'Browse new lamps', quadrant: 'eliminate' },
    { title: 'Sort old photos', quadrant: 'eliminate' },
    { title: 'Check social apps', quadrant: 'eliminate' },
  ];

  const today: DemoConfig['today'] = [
    { title: 'Pay rent', due: iso(now) },
    { title: 'Call dentist', due: iso(addDays(now, 1)) },
    { title: 'Groceries', due: iso(addDays(now, 2)) },
  ];

  return { events, tasks, today };
}
