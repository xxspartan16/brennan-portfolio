# Brennan LeBlanc — software portfolio

[View the live portfolio](https://brennan-portfolio-jade.vercel.app/)

A personal portfolio for three tools: **Gaugeworks**, **Relaylab**, and **Patchglass**. The projects connect a manufacturing and quality-control background to software that makes results inspectable.

## Run locally

Requires Node.js 22.12+ (Node 24 recommended).

```bash
npm ci
npm run dev
npm run build
```

Case studies link to the live apps below. The previously bundled demos remain in `public/demos/` for existing bookmarks. Each project has its own source, tests, and documentation.

| Project | Focus | Live app | Source |
| --- | --- | --- | --- |
| Gaugeworks | Process measurements, control charts, and signal rules | [Try Gaugeworks](https://gaugeworks.vercel.app/) | [xxspartan16/gaugeworks](https://github.com/xxspartan16/gaugeworks) |
| Relaylab | Deterministic workflow execution, retries, and replay | [Try Relaylab](https://relaylab-theta.vercel.app/) | [xxspartan16/relaylab](https://github.com/xxspartan16/relaylab) |
| Patchglass | Guarded JSON migrations and reversible patches | [Try Patchglass](https://patchglass.vercel.app/) | [xxspartan16/patchglass](https://github.com/xxspartan16/patchglass) |

To update bundled demos, clone those repositories beside this one, build each app, then run `npm run refresh-demos` and `npm run check` here.

## Design decisions

- Each case study states the problem, important implementation choices, boundaries, and next substantial feature.
- Project details use a native modal dialog, with focus handling and Escape support supplied by the browser.
- Project filters narrow the gallery, and case studies link to each app and its source.
- No analytics, contact forms, external service credentials, or server persistence.
- Fonts are bundled locally. System font fallbacks keep the site usable if an asset is unavailable.

## Publishing

Vercel detects the Vite application. Build command: `npm run build`. Output: `dist`.

Source links in `src/projects.ts` point to the published repositories. The site serves its interactive 3D studio, project artwork, fonts, and downloadable profile locally. The studio uses Three.js to render its GLB model. The headline uses GSAP for its letter transitions. Visitors can pause motion in the header or set their device’s reduced-motion preference.

## Authorship

Prepared as an AI-assisted personal portfolio for Brennan LeBlanc. These are new v0.1 projects, not a claim of prior employment, customer use, or months of development. Review, understand, and extend the code before using it as evidence of your own fluency in an interview.

MIT licensed. See `LICENSE`.
