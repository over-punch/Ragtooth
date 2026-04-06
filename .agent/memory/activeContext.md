# Active Context — Ragtooth

## Current Focus
Preparing and shipping v1.0.0 — stable public API, complete README, full agent memory.

## What's Done (as of 2026-04-06)
- npm package `ragtooth` published (latest stable: 0.2.6 → targeting 1.0.0)
- Core algorithm: 5-pass saw-rag (reset, widow removal, word wrap, line grouping, tracking)
- All options landed: `sawDepth`, `sawPeriod`, `sawPhase`, `sawAlign`, `maxTracking`
- `RagValue` type: px, %, em, rem, ch units all resolved correctly
- React bindings: `useRag` hook + `RagText` component (forwardRef, auto string-children tracking)
- Vanilla JS API: `applyRag`, `removeRag`, `getCleanHTML`
- Inline element preservation: `<em>`, `<strong>`, etc. survive line breaks (Pass 4 contextual HTML)
- Orphan space fix: trailing whitespace included in last-word spans (Pass 3)
- Leading space fix: first word of each line stripped of leading whitespace (CSS inline-block collapses it)
- Demo site: interactive sliders for all 5 rag options + 3 Merriweather variable font axes (wght/opsz/wdth)
- Hero h1 in Merriweather wght:300 opsz:144 wdth:87
- Slider thumbs: light grey → white on hover

## Deploy pipeline
- Two remotes: `origin` (quitequinn) + `deploy` (github-liiift → Vercel)
- Version bump committed as Liiift, pushed to `deploy` to trigger Vercel build

## Immediate Next Steps
- Bump to 1.0.0 (tag as stable)
- Publish to npm (user must run `npm publish --access public --otp=<code>` after `npm login`)
- Push deploy remote to trigger Vercel site update
- Consider: CHANGELOG, GitHub release notes

## Known Issues
- GitHub Dependabot flagging 9 vulnerabilities in devDependencies (not runtime deps — low priority)
- Font-change detection not implemented (resize triggers re-run but font-load event does not)
