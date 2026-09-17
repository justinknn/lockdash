import { Card } from './Card';
import type { Theme } from '../theme';
import { spacing } from '../theme';
import { yearProgress } from '../../data/dates';

interface YearProgressProps {
  theme: Theme;
  today: Date;
}

/** Simple "% of the year passed" progress bar. */
export function YearProgress({ theme, today }: YearProgressProps) {
  const { year, percent, daysLeft } = yearProgress(today);

  return (
    <Card theme={theme} style={{ gap: spacing.sm }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', color: theme.textPrimary, fontSize: 36, fontWeight: 700 }}>
          {year}
        </div>
        <div style={{ display: 'flex', color: theme.textPrimary, fontSize: 36, fontWeight: 700 }}>
          {percent}%
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.surfaceBorder,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: `${percent}%`,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.accent,
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', color: theme.textMuted, fontSize: 20 }}>
          {percent}% of the year has passed
        </div>
        <div style={{ display: 'flex', color: theme.textMuted, fontSize: 20 }}>
          {daysLeft} days left
        </div>
      </div>
    </Card>
  );
}
