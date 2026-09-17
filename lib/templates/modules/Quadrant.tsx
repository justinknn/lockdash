import type { CSSProperties } from 'react';
import { Card } from './Card';
import type { Theme } from '../theme';
import { spacing } from '../theme';

interface QuadrantItem {
  title: string;
  subtitle?: string;
  done?: boolean;
}

interface QuadrantProps {
  theme: Theme;
  title: string;
  accent: string;
  items: QuadrantItem[];
  style?: CSSProperties;
}

const MAX_ITEMS = 4;

/** One tile of the Eisenhower matrix (Do Now / Schedule / Delegate / Eliminate). */
export function Quadrant({ theme, title, accent, items, style }: QuadrantProps) {
  return (
    <Card theme={theme} style={{ flex: 1, gap: spacing.sm, ...style }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
        >
          <div
            style={{
              display: 'flex',
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: accent,
            }}
          />
          <div style={{ display: 'flex', color: theme.textPrimary, fontSize: 26, fontWeight: 700 }}>
            {title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            minWidth: 30,
            height: 30,
            paddingLeft: 6,
            paddingRight: 6,
            borderRadius: 15,
            backgroundColor: theme.surfaceBorder,
            justifyContent: 'center',
            alignItems: 'center',
            color: theme.textSecondary,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {items.length}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
        {items.slice(0, MAX_ITEMS).map((item, i) => (
          <div
            key={i}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}
          >
            <div
              style={{
                display: 'flex',
                marginTop: 8,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: accent,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', color: theme.textPrimary, fontSize: 22 }}>
                {item.title}
              </div>
              {item.subtitle ? (
                <div style={{ display: 'flex', color: theme.textMuted, fontSize: 18 }}>
                  {item.subtitle}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
