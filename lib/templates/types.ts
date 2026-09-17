import type { LockdashConfig } from '../data/config';

export interface TemplateProps {
  config: LockdashConfig;
  /** Resolved "now" for the render, already applied from config.date/timezone. */
  today: Date;
  /** Pre-fetched background image, or null to fall back to the theme gradient. */
  backgroundDataUri: string | null;
}
