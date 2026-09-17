import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToPng, renderToSvg } from './renderToPng';
import { templates } from '../templates';
import { parseConfig } from '../data/config';
import { buildDemoData } from '../data/demo';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function buildElement(template: 'today' | 'eisenhower') {
  const result = parseConfig({ template, width: 400, height: 800 });
  if (!result.ok) throw new Error(result.error);
  const today = new Date('2026-09-17T09:00:00.000Z');
  const config = { ...result.config, ...buildDemoData(today) };
  const Template = templates[config.template];
  return createElement(Template, { config, today, backgroundDataUri: null });
}

describe('renderToSvg', () => {
  it('produces an SVG document for the today template', async () => {
    const svg = await renderToSvg(buildElement('today'), { width: 400, height: 800 });
    expect(svg).toContain('<svg');
    expect(svg.length).toBeGreaterThan(500);
  });
});

describe('renderToPng', () => {
  it('produces a valid PNG for the today template', async () => {
    const png = await renderToPng(buildElement('today'), { width: 400, height: 800 });
    expect(png.subarray(0, 8)).toEqual(PNG_MAGIC);
    expect(png.length).toBeGreaterThan(1000);
  });

  it('produces a valid, differently-sized PNG for the eisenhower template', async () => {
    const png = await renderToPng(buildElement('eisenhower'), { width: 400, height: 800 });
    expect(png.subarray(0, 8)).toEqual(PNG_MAGIC);
  });
});
