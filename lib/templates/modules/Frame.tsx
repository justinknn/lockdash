import type { CSSProperties, ReactNode } from 'react';
import type { Theme } from '../theme';
import { SAFE_AREA_FRACTION, spacing } from '../theme';

interface FrameProps {
  theme: Theme;
  width: number;
  height: number;
  safeArea: boolean;
  showClock: boolean;
  backgroundDataUri: string | null;
  backgroundDim: number;
  today: Date;
  locale: string;
  children: ReactNode;
}

/**
 * Full-canvas wrapper: background (image or gradient), the safe-area gap
 * reserved for iOS' own status clock/date, and the content area below it.
 */
export function Frame({
  theme,
  width,
  height,
  safeArea,
  showClock,
  backgroundDataUri,
  backgroundDim,
  today,
  locale,
  children,
}: FrameProps) {
  const safeAreaHeight = safeArea ? Math.round(height * SAFE_AREA_FRACTION) : spacing.xl;
  const outerStyle: CSSProperties = backgroundDataUri
    ? {
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
        position: 'relative',
        backgroundColor: '#000',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
        position: 'relative',
        backgroundImage: theme.backgroundGradient,
        backgroundColor: '#000',
      };

  return (
    <div style={outerStyle}>
      {backgroundDataUri ? (
        // Rendered by Satori into a static PNG, not a browser DOM — next/image
        // and a meaningful alt text don't apply here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundDataUri}
          alt=""
          width={width}
          height={height}
          style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
        />
      ) : null}
      {backgroundDataUri ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height,
            display: 'flex',
            backgroundColor: `rgba(0,0,0,${backgroundDim})`,
          }}
        />
      ) : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          width,
          height,
          paddingLeft: spacing.lg,
          paddingRight: spacing.lg,
          paddingBottom: spacing.xl,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: safeAreaHeight,
          }}
        >
          {showClock ? <Clock theme={theme} today={today} locale={locale} /> : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: spacing.md }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Clock({ theme, today, locale }: { theme: Theme; today: Date; locale: string }) {
  const dateLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(today);
  const timeLabel = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).format(today);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: spacing.md }}>
      <div style={{ display: 'flex', color: theme.textSecondary, fontSize: 32, fontWeight: 600 }}>
        {dateLabel}
      </div>
      <div style={{ display: 'flex', color: theme.textPrimary, fontSize: 130, fontWeight: 700 }}>
        {timeLabel}
      </div>
    </div>
  );
}
