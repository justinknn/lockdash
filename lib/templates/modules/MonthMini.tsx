import { Card } from './Card';
import type { Theme } from '../theme';
import { spacing } from '../theme';
import { isSameDay, isSameMonth, monthGrid, weekdayLabels } from '../../data/dates';

interface MonthMiniProps {
  theme: Theme;
  today: Date;
  locale: string;
}

/** Compact month calendar with the current day highlighted, like a system widget. */
export function MonthMini({ theme, today, locale }: MonthMiniProps) {
  const grid = monthGrid(today);
  const weeks = Array.from({ length: 6 }, (_, w) => grid.slice(w * 7, w * 7 + 7));
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'short' }).format(today);

  return (
    <Card theme={theme} style={{ gap: spacing.sm }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: 64, color: theme.textMuted, fontSize: 24, fontWeight: 600 }}>
          {capitalize(monthLabel)}
        </div>
        {weekdayLabels().map((label, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
              color: theme.textMuted,
              fontSize: 22,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: 64 }} />
          {week.map((day, di) => {
            const isToday = isSameDay(day, today);
            const inMonth = isSameMonth(day, today);
            return (
              <div
                key={di}
                style={{
                  display: 'flex',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: 4,
                  paddingBottom: 4,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isToday ? theme.accent : 'transparent',
                    color: isToday ? '#0b1120' : inMonth ? theme.textPrimary : theme.textMuted,
                    fontSize: 24,
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {day.getUTCDate()}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </Card>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
