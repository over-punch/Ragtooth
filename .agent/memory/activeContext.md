# Active Context — Ragtooth

## Current Focus
Package published, site live, deploy pipeline wired up.

## What's Done
- npm package `ragtooth@0.1.1` published to registry
- Core algorithm: 5-pass saw-rag (reset, widow removal, word wrap, line grouping, tracking)
- React bindings: `useRag` hook + `RagText` component
- Vanilla JS API: `applyRag`, `removeRag`, `getCleanHTML`
- Next.js 16 landing site with interactive demo (sliders for sawDepth/sawPeriod/maxTracking)
- Vercel deploy pipeline: `deploy` remote → `Liiift-Studio/Ragtooth` → Vercel

## Performance & Robustness Improvements (2026-04-05)
- `react`/`react-dom` marked as optional peer deps
- ResizeObserver skips re-runs when only height changes (width-only check)
- `applyRag` guards against zero-width (hidden) containers
- `getCleanHTML()` strips rag markup via DOM traversal before snapshotting
- `RagText` auto-tracks string children — no `key` prop needed on content change
- Demo no longer uses redundant `key` prop

## Immediate Next Steps
- Bump version and publish updated package to npm (`0.1.1` → `0.1.2` or minor bump)
- Address GitHub security vulnerabilities (9 flagged: 2 critical, 3 high, 4 moderate)

## Recent Decisions
- **2026-04-05**: Renamed from rag-rub to Ragtooth
- **2026-04-05**: First npm publish at v0.1.0
- **2026-04-05**: Deploy remote added: `git@github-liiift:Liiift-Studio/Ragtooth.git`
