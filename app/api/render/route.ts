import { NextRequest, NextResponse } from 'next/server';
import { createElement } from 'react';
import {
  configFromSearchParams,
  decodeConfigJson,
  decodeConfigParam,
  parseConfig,
  type ConfigParseResult,
  type LockdashConfig,
} from '@/lib/data/config';
import { buildDemoData } from '@/lib/data/demo';
import { templates } from '@/lib/templates';
import { renderToPng, renderToSvg } from '@/lib/render/renderToPng';
import { fetchBackgroundImage } from '@/lib/render/background';
import { ErrorScreen } from '@/lib/templates/errorImage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_WIDTH = 1179;
const DEFAULT_HEIGHT = 2556;

function resolveToday(config: LockdashConfig): Date {
  if (!config.date) return new Date();
  const parsed = new Date(config.date);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** If no events/tasks/today items were supplied at all, show the demo data instead of a blank layout. */
function withDemoFallback(config: LockdashConfig, today: Date): LockdashConfig {
  if (config.events.length > 0 || config.tasks.length > 0 || config.today.length > 0) {
    return config;
  }
  return { ...config, ...buildDemoData(today) };
}

type Format = 'png' | 'svg';

function parseFormat(searchParams: URLSearchParams): Format {
  return searchParams.get('format') === 'svg' ? 'svg' : 'png';
}

async function respond(result: ConfigParseResult, format: Format): Promise<NextResponse> {
  if (!result.ok) {
    return errorResponse(result.error, format);
  }

  const today = resolveToday(result.config);
  const config = withDemoFallback(result.config, today);
  const backgroundDataUri = config.background
    ? await fetchBackgroundImage(config.background)
    : null;

  const Template = templates[config.template];
  const element = createElement(Template, { config, today, backgroundDataUri });

  try {
    return await renderElement(element, config.width, config.height, format, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown render error';
    return errorResponse(`render failed: ${message}`, format);
  }
}

async function errorResponse(message: string, format: Format): Promise<NextResponse> {
  const element = createElement(ErrorScreen, {
    message,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  return renderElement(element, DEFAULT_WIDTH, DEFAULT_HEIGHT, format, 400);
}

async function renderElement(
  element: ReturnType<typeof createElement>,
  width: number,
  height: number,
  format: Format,
  status: number,
): Promise<NextResponse> {
  if (format === 'svg') {
    const svg = await renderToSvg(element, { width, height });
    return new NextResponse(svg, {
      status,
      headers: { 'content-type': 'image/svg+xml', 'cache-control': 'no-store' },
    });
  }
  const png = await renderToPng(element, { width, height });
  return new NextResponse(new Uint8Array(png), {
    status,
    headers: {
      'content-type': 'image/png',
      'cache-control': 'no-store',
      'content-disposition': 'inline; filename="lockdash.png"',
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const format = parseFormat(searchParams);

  const c = searchParams.get('c');
  const result = c ? decodeConfigParam(c) : parseConfig(configFromSearchParams(searchParams));
  return respond(result, format);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const format = parseFormat(request.nextUrl.searchParams);
  const body = await request.text();
  const result = body.trim() ? decodeConfigJson(body) : parseConfig({});
  return respond(result, format);
}
