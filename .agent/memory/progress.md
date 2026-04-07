# Progress — Ragtooth

## What Works Today (2026-04-06)

### Package (`ragtooth`) — v1.1.5
- Core 5-pass algorithm fully implemented and tested (90/90 tests passing)
- All public options: `sawDepth` (RagValue), `sawPeriod`, `sawPhase`, `sawAlign`, `maxTracking` (RagValue)
- `RagValue` unit support: px, %, em, rem, ch
- Inline element preservation through line breaks (`<em>`, `<strong>`, `<a>`, etc.)
- Orphan space fix at inline-element boundaries
- Leading space collapse fix (spaceProbe with distinct class `rag-space-probe`)
- Hyphen-break width fix (white-space:nowrap before BCR measurement)
- SSR-safe (window guard)
- React hook (`useRag`) with ResizeObserver, auto snapshot, width-only resize check
- React component (`RagText`) with forwardRef, auto string-children tracking
- Vanilla JS API (`applyRag`, `removeRag`, `getCleanHTML`)
- Deprecated `ragDifference` prop still accepted as fallback for `sawDepth`

### Landing Site (`ragtooth.liiift.studio`)
- Next.js 16 app, deployed via Liiift Vercel account
- Interactive demo: 5 rag sliders + 3 Merriweather variable font axis sliders + cursor mode
- Cursor mode: mouse X→sawDepth, Y→maxTracking, Esc to exit
- Hero h1 in Merriweather variable font (wght:300, opsz:144, wdth:87)
- Slider thumbs: light → white on hover
- Merriweather loaded from local TTF files (`site/public/fonts/`)
- Vanilla JS usage example in landing page code blocks
- Custom syntax highlighter (bold keywords, italic strings, muted punctuation)
- "What is sawtooth rag?" two-column section with sm breakpoint
- Options table with hover highlight

## What's Left
- [ ] Marketing / landing page copy improvements
- [ ] CHANGELOG or GitHub release notes
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
- **2026-04-06**: v1.1.x series — BCR measurement, spaceProbe, TreeWalker→childNodes fix; 90/90 tests
