import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface SatoriFont {
  name: string;
  data: Buffer;
  weight: 400 | 600 | 700;
  style: 'normal';
}

let cached: SatoriFont[] | null = null;

const FONT_FILES: Array<{ file: string; weight: SatoriFont['weight'] }> = [
  { file: 'Inter-Regular.ttf', weight: 400 },
  { file: 'Inter-SemiBold.ttf', weight: 600 },
  { file: 'Inter-Bold.ttf', weight: 700 },
];

/** Loads (and caches for the lifetime of the process) the Inter font files used by Satori. */
export async function loadFonts(): Promise<SatoriFont[]> {
  if (cached) return cached;
  const fontsDir = path.join(process.cwd(), 'assets', 'fonts');
  cached = await Promise.all(
    FONT_FILES.map(async ({ file, weight }) => ({
      name: 'Inter',
      data: await readFile(path.join(fontsDir, file)),
      weight,
      style: 'normal' as const,
    })),
  );
  return cached;
}
