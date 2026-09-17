import type { ReactElement } from 'react';
import type { TemplateName } from '../data/config';
import type { TemplateProps } from './types';
import { TodayTemplate } from './today';
import { EisenhowerTemplate } from './eisenhower';

export const templates: Record<TemplateName, (props: TemplateProps) => ReactElement> = {
  today: TodayTemplate,
  eisenhower: EisenhowerTemplate,
};

export type { TemplateProps } from './types';
