import { z } from 'zod';

/**
 * Config schema for a single render request. Everything is optional with a
 * sensible default so a minimal `{}` still renders something useful (the
 * demo data), and a Shortcut only needs to send the fields it actually has.
 */

const eventSchema = z.object({
  title: z.string().min(1).max(80),
  /** ISO date or date-time. Only the date part is used for placement. */
  start: z.string().min(1),
  end: z.string().optional(),
  allDay: z.boolean().optional(),
  /** One of the theme's category colors, see lib/templates/theme.ts */
  color: z.string().optional(),
});

const quadrantSchema = z.enum(['do', 'schedule', 'delegate', 'eliminate']);

const taskSchema = z.object({
  title: z.string().min(1).max(80),
  due: z.string().optional(),
  quadrant: quadrantSchema.optional(),
  done: z.boolean().optional(),
});

const todoSchema = z.object({
  title: z.string().min(1).max(80),
  due: z.string().optional(),
  done: z.boolean().optional(),
});

export const themeNameSchema = z.enum(['midnight', 'graphite', 'ink']);
export const templateNameSchema = z.enum(['today', 'eisenhower']);

export const configSchema = z.object({
  template: templateNameSchema.default('today'),
  /** ISO date (yyyy-mm-dd) or date-time. Defaults to "now". */
  date: z.string().optional(),
  timezone: z.string().default('Europe/Berlin'),
  locale: z.string().default('de'),
  theme: themeNameSchema.default('midnight'),
  /** https URL to an image used as the wallpaper background. */
  background: z.string().url().startsWith('https://').optional(),
  backgroundDim: z.number().min(0).max(1).default(0.45),
  /** Keep the top of the image empty so iOS' own clock/date stays legible. */
  safeArea: z.boolean().default(true),
  /** Render a clock in the image too. Only useful for previews/mockups. */
  showClock: z.boolean().default(false),
  width: z.number().int().min(300).max(2400).default(1179),
  height: z.number().int().min(600).max(4000).default(2556),
  events: z.array(eventSchema).max(100).default([]),
  tasks: z.array(taskSchema).max(60).default([]),
  today: z.array(todoSchema).max(12).default([]),
});

export type LockdashConfig = z.output<typeof configSchema>;
export type ThemeName = z.infer<typeof themeNameSchema>;
export type TemplateName = z.infer<typeof templateNameSchema>;
export type Quadrant = z.infer<typeof quadrantSchema>;

export type ConfigParseResult = { ok: true; config: LockdashConfig } | { ok: false; error: string };

const MAX_INPUT_BYTES = 64 * 1024;

/** Parses a raw config object (already-decoded JSON) into a validated config. */
export function parseConfig(input: unknown): ConfigParseResult {
  const result = configSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: result.error.issues.map(formatIssue).join('; ') };
  }
  return { ok: true, config: result.data };
}

/** Decodes a base64url-encoded JSON string (the `c` query param) into a config. */
export function decodeConfigParam(param: string): ConfigParseResult {
  if (param.length > MAX_INPUT_BYTES) {
    return { ok: false, error: 'config parameter too large' };
  }
  let json: string;
  try {
    const base64 = param.replace(/-/g, '+').replace(/_/g, '/');
    json = Buffer.from(base64, 'base64').toString('utf-8');
  } catch {
    return { ok: false, error: 'config parameter is not valid base64' };
  }
  return decodeConfigJson(json);
}

/** Parses a raw JSON string (e.g. a POST body) into a validated config. */
export function decodeConfigJson(json: string): ConfigParseResult {
  if (Buffer.byteLength(json, 'utf-8') > MAX_INPUT_BYTES) {
    return { ok: false, error: 'request body too large' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'body is not valid JSON' };
  }
  return parseConfig(parsed);
}

function formatIssue(issue: { path: PropertyKey[]; message: string }): string {
  const path = issue.path.join('.') || '(root)';
  return `${path}: ${issue.message}`;
}

/**
 * Builds a plain (pre-validation) config object from simple query params,
 * for quick manual testing (`?template=eisenhower&theme=ink`) without
 * having to base64-encode a full JSON config.
 */
export function configFromSearchParams(searchParams: URLSearchParams): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const str = (key: string) => {
    const value = searchParams.get(key);
    if (value !== null) out[key] = value;
  };
  const bool = (key: string) => {
    const value = searchParams.get(key);
    if (value !== null) out[key] = value === 'true' || value === '1';
  };
  const num = (key: string) => {
    const value = searchParams.get(key);
    if (value !== null && value !== '') out[key] = Number(value);
  };

  str('template');
  str('theme');
  str('locale');
  str('timezone');
  str('date');
  str('background');
  bool('safeArea');
  bool('showClock');
  num('backgroundDim');
  num('width');
  num('height');

  return out;
}
