# Progress — Ragtooth

## What Works Today (2026-04-06)

### Package (`ragtooth`)
- Core 5-pass algorithm fully implemented and tested (tests passing)
- All public options: `sawDepth` (RagValue), `sawPeriod`, `sawPhase`, `sawAlign`, `maxTracking` (RagValue)
- `RagValue` unit support: px, %, em, rem, ch
- Inline element preservation through line breaks (`<em>`, `<strong>`, `<a>`, etc.)
- Orphan space fix at inline-element boundaries
- Leading space collapse fix for first word of each line
- SSR-safe (window guard)
- React hook (`useRag`) with ResizeObserver, auto snapshot, width-only resize check
- React component (`RagText`) with forwardRef, auto string-children tracking
- Vanilla JS API (`applyRag`, `removeRag`, `getCleanHTML`)
- Deprecated `ragDifference` prop still accepted as fallback for `sawDepth`

### Landing Site (`ragtooth.liiift.studio`)
- Next.js 16 app, deployed via Liiift Vercel account
- Interactive demo: 5 rag sliders + 3 Merriweather variable font axis sliders
- Hero h1 in Merriweather variable font (wght:300, opsz:144, wdth:87)
- Slider thumbs: light → white on hover
- Merriweather loaded from local TTF files (`site/public/fonts/`)

## What's Left
- [ ] Publish v1.0.0 to npm (requires `npm login` + OTP — user does this manually)
- [ ] CHANGELOG or GitHub release notes for v1
- [ ] Font-load event detection (currently only resize triggers re-run)
- [ ] Address GitHub Dependabot vulnerabilities in devDependencies

## Decision Log
- **2026-04-04**: Project initialized from CodePen prototype
- **2026-04-05**: Renamed from rag-rub to Ragtooth; first npm publish at v0.1.0
- **2026-04-05**: React/react-dom marked optional peer deps
- **2026-04-05**: Deploy pipeline wired: Liiift-Studio/Ragtooth → Vercel
- **2026-04-06**: Added sawDepth ch unit, sawAlign (top/bottom), sawPhase options
- **2026-04-06**: Inline element preservation (Pass 4 contextual HTML wrapping)
- **2026-04-06**: Orphan space + leading-space-collapse fixes
- **2026-04-06**: Variable font demo (wght/opsz/wdth sliders) + Merriweather local fonts
- **2026-04-06**: README rewritten for v1; all memory files updated
