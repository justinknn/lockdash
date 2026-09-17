import { describe, expect, it } from 'vitest';
import {
  addDays,
  isSameDay,
  isSameMonth,
  monthGrid,
  parseDay,
  startOfWeekSunday,
  toDayKey,
  weekDays,
  weekdayLabels,
  yearProgress,
} from './dates';

describe('parseDay / toDayKey', () => {
  it('round-trips a date-only string', () => {
    const d = parseDay('2026-09-17');
    expect(toDayKey(d)).toBe('2026-09-17');
  });

  it('ignores the time portion of a full ISO string', () => {
    const d = parseDay('2026-09-17T14:30:00.000Z');
    expect(toDayKey(d)).toBe('2026-09-17');
  });
});

describe('addDays / isSameDay', () => {
  it('adds days across a month boundary', () => {
    const d = addDays(parseDay('2026-01-31'), 1);
    expect(toDayKey(d)).toBe('2026-02-01');
  });

  it('isSameDay compares by calendar day only', () => {
    expect(isSameDay(parseDay('2026-09-17'), parseDay('2026-09-17'))).toBe(true);
    expect(isSameDay(parseDay('2026-09-17'), parseDay('2026-09-18'))).toBe(false);
  });
});

describe('startOfWeekSunday / weekDays', () => {
  it('returns Sunday for a Thursday', () => {
    // 2026-09-17 is a Thursday
    const sunday = startOfWeekSunday(parseDay('2026-09-17'));
    expect(toDayKey(sunday)).toBe('2026-09-13');
  });

  it('returns 7 consecutive days starting on Sunday', () => {
    const days = weekDays(parseDay('2026-09-17'));
    expect(days).toHaveLength(7);
    expect(toDayKey(days[0]!)).toBe('2026-09-13');
    expect(toDayKey(days[6]!)).toBe('2026-09-19');
  });
});

describe('monthGrid / isSameMonth', () => {
  it('produces a 42-day grid', () => {
    const grid = monthGrid(parseDay('2026-09-17'));
    expect(grid).toHaveLength(42);
  });

  it('includes the requested day within the grid', () => {
    const today = parseDay('2026-09-17');
    const grid = monthGrid(today);
    expect(grid.some((d) => isSameDay(d, today) && isSameMonth(d, today))).toBe(true);
  });
});

describe('yearProgress', () => {
  it('reports 0% on Jan 1st', () => {
    const { percent } = yearProgress(parseDay('2026-01-01'));
    expect(percent).toBe(0);
  });

  it('reports close to 100% on Dec 31st', () => {
    const { percent, daysLeft } = yearProgress(parseDay('2026-12-31'));
    expect(percent).toBeGreaterThanOrEqual(99);
    expect(daysLeft).toBe(1);
  });
});

describe('weekdayLabels', () => {
  it('is Sunday-first', () => {
    expect(weekdayLabels()).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });
});
