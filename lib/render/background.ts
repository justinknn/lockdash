import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const FETCH_TIMEOUT_MS = 5_000;
const MAX_BYTES = 4 * 1024 * 1024;
const CACHE_TTL_MS = 10 * 60 * 1000;
const ALLOWED_CONTENT_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

type CacheEntry = { dataUri: string; expiresAt: number };
const cache = new Map<string, CacheEntry>();

/**
 * Fetches an https image URL and returns it as a data URI, for embedding
 * directly in the Satori tree. Guards against SSRF (private/link-local
 * targets), oversized responses and unexpected content types. Any failure
 * results in `null` so callers can fall back to the theme gradient instead
 * of failing the whole render.
 */
export async function fetchBackgroundImage(url: string): Promise<string | null> {
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.dataUri;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    if (await isDisallowedHost(parsed.hostname)) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(parsed.toString(), {
        signal: controller.signal,
        redirect: 'error', // avoid redirecting to an internal host
        headers: { accept: 'image/png,image/jpeg,image/webp' },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) return null;
    const contentType = response.headers.get('content-type')?.split(';')[0]?.trim();
    if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) return null;

    const buffer = await readWithLimit(response, MAX_BYTES);
    if (!buffer) return null;

    const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`;
    cache.set(url, { dataUri, expiresAt: Date.now() + CACHE_TTL_MS });
    return dataUri;
  } catch {
    return null;
  }
}

async function readWithLimit(response: Response, maxBytes: number): Promise<Buffer | null> {
  const contentLength = response.headers.get('content-length');
  if (contentLength && Number(contentLength) > maxBytes) return null;
  if (!response.body) return null;

  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks);
}

async function isDisallowedHost(hostname: string): Promise<boolean> {
  if (hostname === 'localhost') return true;
  const literalIp = isIP(hostname) ? hostname : null;
  const ips: string[] = [];
  if (literalIp) {
    ips.push(literalIp);
  } else {
    try {
      const results = await lookup(hostname, { all: true });
      ips.push(...results.map((r) => r.address));
    } catch {
      return true; // can't resolve -> refuse rather than risk it
    }
  }
  return ips.some(isPrivateOrReservedIp);
}

function isPrivateOrReservedIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts as [number, number, number, number];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  if (isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::1') return true;
    if (lower.startsWith('fe80:')) return true; // link-local
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local
    if (lower.startsWith('::ffff:')) {
      return isPrivateOrReservedIp(lower.replace('::ffff:', ''));
    }
    return false;
  }
  return true; // unknown format -> refuse
}
