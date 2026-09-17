import { Card } from './Card';
import type { Theme } from '../theme';
import { spacing } from '../theme';
import { parseDay } from '../../data/dates';

interface TodayItem {
  title: string;
  due?: string;
  done?: boolean;
}

interface TodayListProps {
  theme: Theme;
  items: TodayItem[];
  locale: string;
  title?: string;
}

/** "Today" checklist card: a short list of upcoming items with their due date. */
export function TodayList({ theme, items, locale, title = 'Today' }: TodayListProps) {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric' });

  return (
    <Card theme={theme} style={{ gap: spacing.sm }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <div
          style={{
            display: 'flex',
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: theme.danger,
          }}
        />
        <div style={{ color: theme.textPrimary, fontSize: 28, fontWeight: 700 }}>{title}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
        {items.slice(0, 6).map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 22,
                height: 22,
                borderRadius: 11,
                border: `2px solid ${item.done ? theme.accent : theme.textMuted}`,
                backgroundColor: item.done ? theme.accent : 'transparent',
              }}
            />
            <div
              style={{
                display: 'flex',
                flex: 1,
                color: theme.textPrimary,
                fontSize: 26,
                textDecoration: item.done ? 'line-through' : 'none',
              }}
            >
              {item.title}
            </div>
            {item.due ? (
              <div style={{ display: 'flex', color: theme.textMuted, fontSize: 22 }}>
                {formatter.format(parseDay(item.due))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
