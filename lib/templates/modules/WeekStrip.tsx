import { Card } from './Card';
import type { Theme } from '../theme';
import { colorForLabel, spacing } from '../theme';
import { isSameDay, parseDay, toDayKey, weekDays } from '../../data/dates';

interface WeekEvent {
  title: string;
  start: string;
  end?: string;
  color?: string;
}

interface WeekStripProps {
  theme: Theme;
  today: Date;
  events: WeekEvent[];
  locale: string;
}

const MAX_CHIPS_PER_DAY = 3;

/** 7-day strip with each day's events shown as small colored bars underneath. */
export function WeekStrip({ theme, today, events, locale }: WeekStripProps) {
  const days = weekDays(today);
  const dayLabelFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

  return (
    <Card theme={theme} style={{ gap: spacing.sm }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', color: theme.textMuted, fontSize: 20 }}>
                {capitalize(dayLabelFormatter.format(day))}
              </div>
              <div
                style={{
                  display: 'flex',
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: isToday ? theme.accent : 'transparent',
                  color: isToday ? '#0b1120' : theme.textPrimary,
                  fontSize: 26,
                  fontWeight: isToday ? 700 : 600,
                }}
              >
                {day.getUTCDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {days.map((day, i) => {
          const dayEvents = events.filter((event) => eventOccursOnDay(event, day));
          const visible = dayEvents.slice(0, MAX_CHIPS_PER_DAY);
          const overflow = dayEvents.length - visible.length;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                gap: 4,
                paddingLeft: 3,
                paddingRight: 3,
              }}
            >
              {visible.map((event, ei) => (
                <div
                  key={ei}
                  style={{
                    display: 'flex',
                    backgroundColor: colorForLabel(event.title, event.color),
                    borderRadius: 6,
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 6,
                    paddingRight: 6,
                    color: '#0b1120',
                    fontSize: 16,
                    fontWeight: 600,
                    overflow: 'hidden',
                  }}
                >
                  {event.title}
                </div>
              ))}
              {overflow > 0 ? (
                <div style={{ display: 'flex', color: theme.textMuted, fontSize: 16 }}>
                  +{overflow}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function eventOccursOnDay(event: WeekEvent, day: Date): boolean {
  const start = toDayKey(parseDay(event.start));
  const end = toDayKey(parseDay(event.end ?? event.start));
  const key = toDayKey(day);
  return key >= start && key <= end;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
