'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const DEFAULT_CONFIG = JSON.stringify(
  {
    tasks: [
      { title: 'Pay utility bill', due: new Date().toISOString(), quadrant: 'do' },
      { title: 'Plan weekly meals', quadrant: 'schedule' },
      { title: 'Book team room', quadrant: 'delegate' },
      { title: 'Browse new lamps', quadrant: 'eliminate' },
    ],
    today: [{ title: 'Pay rent' }, { title: 'Call dentist' }],
  },
  null,
  2,
);

export default function Home() {
  const [template, setTemplate] = useState<'today' | 'eisenhower'>('today');
  const [theme, setTheme] = useState<'midnight' | 'graphite' | 'ink'>('midnight');
  const [configJson, setConfigJson] = useState(DEFAULT_CONFIG);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function render() {
    setStatus('loading');
    setErrorMessage('');
    let parsed: Record<string, unknown>;
    try {
      parsed = configJson.trim() ? JSON.parse(configJson) : {};
    } catch {
      setStatus('error');
      setErrorMessage('Config is not valid JSON.');
      return;
    }

    const body = JSON.stringify({ ...parsed, template, theme });
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    const blob = await res.blob();
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
    setStatus(res.ok ? 'idle' : 'error');
    if (!res.ok) setErrorMessage('Server returned an error image, see below.');
  }

  useEffect(() => {
    // Fetch-on-mount to show an initial preview; render() itself only
    // updates state inside its own async continuation, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shortcutUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/render?template=${template}&theme=${theme}`
      : `/api/render?template=${template}&theme=${theme}`;

  return (
    <main style={{ display: 'flex', minHeight: '100vh' }}>
      <section
        style={{
          width: 420,
          padding: 24,
          borderRight: '1px solid #23252b',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>Lockdash</h1>
        <p style={{ margin: 0, color: '#9a9da5', fontSize: 14 }}>
          Preview the wallpaper PNG rendered by <code>/api/render</code>. Edit the config, hit
          render, and copy the resulting URL into an iOS Shortcut.
        </p>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          Template
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as 'today' | 'eisenhower')}
            style={selectStyle}
          >
            <option value="today">Today + week</option>
            <option value="eisenhower">Eisenhower matrix</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          Theme
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'midnight' | 'graphite' | 'ink')}
            style={selectStyle}
          >
            <option value="midnight">Midnight</option>
            <option value="graphite">Graphite</option>
            <option value="ink">Ink</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, flex: 1 }}>
          Config JSON (events / tasks / today)
          <textarea
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              minHeight: 260,
              background: '#111318',
              color: '#e6e7ea',
              border: '1px solid #2a2d34',
              borderRadius: 8,
              padding: 12,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 13,
              resize: 'vertical',
            }}
          />
        </label>

        <button
          onClick={render}
          disabled={status === 'loading'}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#7c9bff',
            color: '#0b1120',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {status === 'loading' ? 'Rendering…' : 'Render'}
        </button>

        {errorMessage ? (
          <p style={{ color: '#ff9a9a', fontSize: 13, margin: 0 }}>{errorMessage}</p>
        ) : null}

        <div style={{ fontSize: 13, color: '#9a9da5' }}>
          <p style={{ margin: '8px 0 4px' }}>Shortcut URL (demo data, no config):</p>
          <code
            style={{
              display: 'block',
              wordBreak: 'break-all',
              background: '#111318',
              padding: 8,
              borderRadius: 6,
            }}
          >
            {shortcutUrl}
          </code>
          <p style={{ margin: '12px 0 4px' }}>iOS Shortcut:</p>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            <li>&quot;Get contents of URL&quot; → POST, JSON body with your data.</li>
            <li>&quot;Set Wallpaper&quot; → Lock Screen, preview off.</li>
            <li>Personal Automation &quot;Time of Day&quot; → Run Immediately.</li>
          </ol>
        </div>
      </section>

      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <div
          style={{
            width: 300,
            aspectRatio: '1179 / 2556',
            borderRadius: 40,
            overflow: 'hidden',
            border: '6px solid #2a2d34',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            background: '#000',
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Lockdash preview"
              style={{ width: '100%', display: 'block' }}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

const selectStyle: CSSProperties = {
  background: '#111318',
  color: '#e6e7ea',
  border: '1px solid #2a2d34',
  borderRadius: 8,
  padding: '8px 10px',
};
