import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { ReactElement, ReactNode } from 'react';
import { loadFonts } from './fonts';

export interface RenderOptions {
  width: number;
  height: number;
}

/** Renders a React element tree to an SVG string via Satori. */
export async function renderToSvg(element: ReactNode, { width, height }: RenderOptions) {
  const fonts = await loadFonts();
  return satori(element as ReactElement, {
    width,
    height,
    fonts,
  });
}

/** Renders a React element tree to a PNG buffer (Satori -> resvg). */
export async function renderToPng(element: ReactNode, options: RenderOptions): Promise<Buffer> {
  const svg = await renderToSvg(element, options);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: options.width },
  });
  return Buffer.from(resvg.render().asPng());
}
