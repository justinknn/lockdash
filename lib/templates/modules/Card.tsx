import type { CSSProperties, ReactNode } from 'react';
import type { Theme } from '../theme';
import { radius, spacing } from '../theme';

interface CardProps {
  theme: Theme;
  children: ReactNode;
  style?: CSSProperties;
  padding?: number;
}

/** Shared translucent panel used by every module — the visual base unit of the layout. */
export function Card({ theme, children, style, padding = spacing.md }: CardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.surface,
        border: `1px solid ${theme.surfaceBorder}`,
        borderRadius: radius.md,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
