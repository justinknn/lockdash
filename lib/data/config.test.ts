import { describe, expect, it } from 'vitest';
import { decodeConfigJson, decodeConfigParam, parseConfig } from './config';

describe('parseConfig', () => {
  it('fills in defaults for an empty object', () => {
    const result = parseConfig({});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.template).toBe('today');
      expect(result.config.theme).toBe('midnight');
      expect(result.config.events).toEqual([]);
      expect(result.config.width).toBe(1179);
    }
  });

  it('accepts a fully populated config', () => {
    const result = parseConfig({
      template: 'eisenhower',
      theme: 'ink',
      tasks: [{ title: 'Pay rent', due: '2026-09-18', quadrant: 'do' }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.tasks).toHaveLength(1);
      expect(result.config.tasks[0]?.quadrant).toBe('do');
    }
  });

  it('rejects an invalid template name', () => {
    const result = parseConfig({ template: 'not-a-template' });
    expect(result.ok).toBe(false);
  });

  it('rejects a background URL that is not https', () => {
    const result = parseConfig({ background: 'http://example.com/a.png' });
    expect(result.ok).toBe(false);
  });
});

describe('decodeConfigJson', () => {
  it('rejects malformed JSON', () => {
    const result = decodeConfigJson('{not json');
    expect(result.ok).toBe(false);
  });

  it('parses valid JSON into a config', () => {
    const result = decodeConfigJson(JSON.stringify({ theme: 'graphite' }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config.theme).toBe('graphite');
  });
});

describe('decodeConfigParam', () => {
  it('round-trips a base64url-encoded config', () => {
    const original = { template: 'eisenhower' as const, theme: 'graphite' as const };
    const encoded = Buffer.from(JSON.stringify(original))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const result = decodeConfigParam(encoded);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.template).toBe('eisenhower');
      expect(result.config.theme).toBe('graphite');
    }
  });

  it('rejects invalid base64', () => {
    const result = decodeConfigParam('%%%not-base64%%%');
    expect(result.ok).toBe(false);
  });
});
