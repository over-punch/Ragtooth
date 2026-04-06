# Tech Context — Ragtooth

## Package
- Name: `ragtooth`
- Version: `1.0.0` (targeting v1 — stable public API)
- npm: public, unprefixed

## Build
- Vite (library mode) → ESM (`dist/index.js`) + CJS (`dist/index.cjs`) + types (`dist/index.d.ts`)
- TypeScript 5, strict
- Peer deps: `react >=17` and `react-dom >=17` (both optional)
- No runtime dependencies

## Algorithm stack
- `src/core/adjust.ts` — 5-pass DOM mutation algorithm (reset, widow removal, word wrap, line grouping, tracking)
- `src/core/resolve.ts` — RagValue unit converter (px, %, em, rem, ch)
- `src/core/types.ts` — shared types: `RagOptions`, `RagValue`, `RAG_CLASSES`
- `src/react/useRag.ts` — hook: ResizeObserver, snapshot, re-runs on width change or options change
- `src/react/RagText.tsx` — component: forwardRef wrapper around useRag
- `src/index.ts` — barrel export

## Landing site
- `site/` — Next.js 16 app (App Router), Tailwind CSS v4 (JIT)
- `site/src/app/page.tsx` — landing page with hero, demo, options table, usage examples
- `site/src/components/Demo.tsx` — interactive sliders for all 5 rag options + 3 variable font axes
- Font: Merriweather variable (local TTFs from `site/public/fonts/`)
  - `Merriweather.ttf` — upright, wght 100–900, opsz 7–144, wdth 87–112
  - `Merriweather-Italic.ttf` — italic, same axes
  - `font-variation-settings` required to activate opsz and wdth axes (font-weight alone is not enough)

## Deploy pipeline
- Two git remotes:
  - `origin` → `git@github.com:quitequinn/Ragtooth.git` (code)
  - `deploy` → `git@github-liiift:Liiift-Studio/Ragtooth.git` (triggers Vercel)
- Version bump commit made as Liiift identity, pushed to `deploy` to trigger Vercel
- npm publish: `npm publish --access public` (requires login; may need OTP)

## Key constraints
- Must be SSR-safe: all DOM access gated on `typeof window !== 'undefined'`
- Algorithm must run after browser layout (uses `offsetWidth`) — guarded against `offsetWidth === 0`
- ResizeObserver fires on any size change; algorithm skips if container width hasn't changed
