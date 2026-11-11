# Brennan LeBlanc — software portfolio

A personal portfolio for three tools: **Gaugeworks**, **Relaylab**, and **Patchglass**. The projects connect a manufacturing and quality-control background to software that makes results inspectable.

## Run locally

Requires Node.js 22.12+ (Node 24 recommended).

```bash
npm ci
npm run dev
npm run build
```

The portfolio includes static demo builds in `public/demos/`, so each case study opens a working application on the same deployment. The demo copies are generated assets. Each project's original source, tests, and documentation lives in its own repository:

| Project | Focus | Source |
| --- | --- | --- |
| Gaugeworks | Process measurements, control charts, and signal rules | [xxspartan16/gaugeworks](https://github.com/xxspartan16/gaugeworks) |
| Relaylab | Deterministic workflow execution, retries, and replay | [xxspartan16/relaylab](https://github.com/xxspartan16/relaylab) |
| Patchglass | Guarded JSON migrations and reversible patches | [xxspartan16/patchglass](https://github.com/xxspartan16/patchglass) |

To update bundled demos, clone those repositories beside this one, build each app, then run `npm run refresh-demos` and `npm run check` here.

## Design decisions

- Each case study states the problem, important implementation choices, boundaries, and next substantial feature.
- Project details use a native modal dialog, with focus handling and Escape support supplied by the browser.
- Project filters use real state; links to demos open independent local apps.
- No analytics, contact forms, external service credentials, or server persistence.
- Fonts are bundled locally. System font fallbacks keep the site usable if an asset is unavailable.

## Publishing

Vercel detects the Vite application. Build command: `npm run build`. Output: `dist`.

Source links in `src/projects.ts` point to the published repositories. The relative demo links work both in local development and on Vercel; they require no API keys or paid services.

## Authorship

Prepared as an AI-assisted personal portfolio for Brennan LeBlanc. These are new v0.1 projects, not a claim of prior employment, customer use, or months of development. Review, understand, and extend the code before using it as evidence of your own fluency in an interview.

MIT licensed. See `LICENSE`.
