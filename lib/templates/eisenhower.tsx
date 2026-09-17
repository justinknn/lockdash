import { Frame } from './modules/Frame';
import { MonthMini } from './modules/MonthMini';
import { TodayList } from './modules/TodayList';
import { Quadrant } from './modules/Quadrant';
import { spacing, themes } from './theme';
import type { Theme } from './theme';
import { formatDueLabel } from '../data/format';
import type { Quadrant as QuadrantName } from '../data/config';
import type { TemplateProps } from './types';

const QUADRANTS: Array<{
  key: QuadrantName;
  title: string;
  accentKey: 'danger' | 'accent' | 'amber' | 'muted';
}> = [
  { key: 'do', title: 'Do Now', accentKey: 'danger' },
  { key: 'schedule', title: 'Schedule', accentKey: 'accent' },
  { key: 'delegate', title: 'Delegate', accentKey: 'amber' },
  { key: 'eliminate', title: 'Eliminate', accentKey: 'muted' },
];

const AMBER = '#f2b25c';

/** Eisenhower matrix layout: month, today list, and the 4-quadrant priority grid. */
export function EisenhowerTemplate({ config, today, backgroundDataUri }: TemplateProps) {
  const theme = themes[config.theme];
  const accentFor = (key: (typeof QUADRANTS)[number]['accentKey']) =>
    key === 'danger'
      ? theme.danger
      : key === 'accent'
        ? theme.accent
        : key === 'amber'
          ? AMBER
          : theme.textMuted;

  return (
    <Frame
      theme={theme}
      width={config.width}
      height={config.height}
      safeArea={config.safeArea}
      showClock={config.showClock}
      backgroundDataUri={backgroundDataUri}
      backgroundDim={config.backgroundDim}
      today={today}
      locale={config.locale}
    >
      <MonthMini theme={theme} today={today} locale={config.locale} />
      <TodayList theme={theme} items={config.today} locale={config.locale} />
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, gap: spacing.md }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: spacing.md }}>
          {renderQuadrant(QUADRANTS[0]!, config, today, theme, accentFor)}
          {renderQuadrant(QUADRANTS[2]!, config, today, theme, accentFor)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: spacing.md }}>
          {renderQuadrant(QUADRANTS[1]!, config, today, theme, accentFor)}
          {renderQuadrant(QUADRANTS[3]!, config, today, theme, accentFor)}
        </div>
      </div>
    </Frame>
  );
}

function renderQuadrant(
  quadrant: (typeof QUADRANTS)[number],
  config: TemplateProps['config'],
  today: Date,
  theme: Theme,
  accentFor: (key: (typeof QUADRANTS)[number]['accentKey']) => string,
) {
  const tasks = config.tasks.filter((t) => (t.quadrant ?? 'schedule') === quadrant.key);
  const items = tasks.map((t) => ({
    title: t.title,
    subtitle: t.due ? formatDueLabel(t.due, today, config.locale) : undefined,
    done: t.done,
  }));
  return (
    <Quadrant
      key={quadrant.key}
      theme={theme}
      title={quadrant.title}
      accent={accentFor(quadrant.accentKey)}
      items={items}
    />
  );
}
