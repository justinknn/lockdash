import { Frame } from './modules/Frame';
import { MonthMini } from './modules/MonthMini';
import { TodayList } from './modules/TodayList';
import { WeekStrip } from './modules/WeekStrip';
import { YearProgress } from './modules/YearProgress';
import { themes } from './theme';
import type { TemplateProps } from './types';

/** "Today + week" layout: month, today list, week strip, year progress. */
export function TodayTemplate({ config, today, backgroundDataUri }: TemplateProps) {
  const theme = themes[config.theme];

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
      <WeekStrip theme={theme} today={today} events={config.events} locale={config.locale} />
      <YearProgress theme={theme} today={today} />
    </Frame>
  );
}
