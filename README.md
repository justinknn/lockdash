# Lockdash

Lockdash renders your calendar and tasks as a PNG "dashboard" wallpaper. An
iOS Shortcut fetches that image on a schedule and sets it as your **lock
screen** background — so you get a glanceable overview (mini calendar,
today's tasks, week strip, Eisenhower matrix) without unlocking your phone.

There's no such thing as a real third-party lock-screen widget on iOS, so
this takes the well-known workaround: render a wallpaper image server-side,
and use the native "Set Wallpaper" Shortcut action to apply it.

> **Status:** MVP. Two templates, one API route, no persistence yet — see
> [Roadmap](#roadmap).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for a live preview (edit
the JSON, pick a template/theme, see the rendered PNG). Or call the API
directly:

```bash
# Demo data, default theme
curl "http://localhost:3000/api/render?template=today" -o wallpaper.png

# Eisenhower matrix, dark "ink" theme
curl "http://localhost:3000/api/render?template=eisenhower&theme=ink" -o wallpaper.png

# Your own data, via POST (what the Shortcut actually does)
curl -X POST http://localhost:3000/api/render \
  -H 'content-type: application/json' \
  -d '{
    "template": "today",
    "theme": "midnight",
    "today": [{ "title": "Pay rent", "due": "2026-09-18" }],
    "tasks": [{ "title": "Fix sign-in bug", "due": "2026-09-18T09:30:00Z", "quadrant": "do" }],
    "events": [{ "title": "Conference", "start": "2026-09-14", "end": "2026-09-16" }]
  }' -o wallpaper.png
```

If a request has no `events`, `tasks`, or `today` items at all, the demo
data is shown instead of a blank layout — that's why the first two examples
above still produce a populated image.

## How it works

```
iOS Shortcut ──POST JSON / GET ?c=<base64>──▶ /api/render
                                                │
                                       validate config (zod)
                                                │
                                        pick a template (JSX)
                                                │
                                    Satori (JSX → SVG) → resvg (SVG → PNG)
                                                │
                                           PNG response
```

- **Templates** (`lib/templates/`) are plain React components built from
  shared modules (`lib/templates/modules/`): a mini month calendar, a
  "Today" checklist, a 7-day event strip, a year-progress bar, and the
  Eisenhower quadrants.
- **Rendering** (`lib/render/`) uses [Satori](https://github.com/vercel/satori)
  to turn that JSX into SVG, then [`@resvg/resvg-js`](https://github.com/thx/resvg-js)
  to rasterize it to PNG — no headless browser needed.
- **Config** (`lib/data/config.ts`) is a small [zod](https://zod.dev) schema.
  Everything is optional; missing fields fall back to sane defaults.
- The top ~34% of the image is left empty on purpose (`safeArea: true`, the
  default) so iOS' own lock-screen clock and date stay legible on top of it.

## Config reference

All fields are optional.

| Field            | Type                                        | Default           | Notes                                                                                                         |
| ---------------- | ------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `template`       | `"today" \| "eisenhower"`                   | `"today"`         |                                                                                                               |
| `theme`          | `"midnight" \| "graphite" \| "ink"`         | `"midnight"`      |                                                                                                               |
| `date`           | ISO date/date-time string                   | now               | What day the render treats as "today"                                                                         |
| `timezone`       | IANA timezone string                        | `"Europe/Berlin"` | Reserved for future use; dates are UTC-day based today                                                        |
| `locale`         | BCP-47 locale string                        | `"de"`            | Used for weekday/month/date formatting                                                                        |
| `background`     | `https://` image URL                        | none              | PNG/JPEG/WebP, ≤4MB; falls back to the theme gradient on any failure                                          |
| `backgroundDim`  | number `0..1`                               | `0.45`            | Dark overlay strength over the background image                                                               |
| `safeArea`       | boolean                                     | `true`            | Reserve the top of the image for iOS' own clock                                                               |
| `showClock`      | boolean                                     | `false`           | Render a clock in the image too (mockups/previews only — iOS shows its own on top of a lock-screen wallpaper) |
| `width`/`height` | number                                      | `1179`/`2556`     | iPhone 15/16 Pro resolution                                                                                   |
| `events`         | `{ title, start, end?, allDay?, color? }[]` | `[]`              | Shown in the week strip                                                                                       |
| `tasks`          | `{ title, due?, quadrant?, done? }[]`       | `[]`              | `quadrant`: `do \| schedule \| delegate \| eliminate`                                                         |
| `today`          | `{ title, due?, done? }[]`                  | `[]`              | Shown in the "Today" checklist                                                                                |

`GET /api/render` also accepts these as plain query params for quick manual
testing (`?template=eisenhower&theme=ink&showClock=true`), or a full config
as base64url-encoded JSON in `?c=`. Add `&format=svg` to either GET or POST
to get the intermediate SVG instead of a PNG (handy for debugging layout).
An invalid config returns HTTP 400 with a PNG that says what's wrong,
instead of a blank image — useful since a Shortcut has no console to check.

## Setting it up as your lock screen

1. Deploy this somewhere reachable from your phone (or run it on your Mac
   and use its LAN address while testing).
2. Build a Shortcut:
   - **Get contents of URL** — `POST` to `/api/render`, JSON body with your
     data (or read your calendar/reminders first and build the body from
     that).
   - **Set Wallpaper** — Lock Screen, preview off — using the image from
     the previous step.
3. Add a **Personal Automation**: "Time of Day" (repeat as often as you
   like), "Run Immediately", with "Ask Before Running" turned **off**.
4. Run the automation once manually to confirm it actually sets the
   wallpaper.

`showClock` stays `false` for this use case — iOS already renders its own
clock and date on top of the lock screen wallpaper.

## Development

```bash
npm run dev           # dev server with hot reload
npm run build          # production build
npm run lint            # ESLint
npm run format          # Prettier --write
npm test                 # Vitest (config parsing, date math, PNG smoke tests)
```

Inter is bundled under `assets/fonts/` (SIL Open Font License, see
`assets/fonts/LICENSE-Inter.txt`) instead of SF Pro, which isn't licensed
for server-side embedding.

## Roadmap

This repo currently covers phases 1–4 of the project plan (rendering engine,
dynamic config, both templates). Not yet built:

- Persistence (`/r/:token` reading a saved config from a database instead of
  a request body/query string)
- Docker image + `docker-compose.yml` for one-command self-hosting
- Hosted SaaS layer (auth, billing, rate limiting)

## License

MIT
