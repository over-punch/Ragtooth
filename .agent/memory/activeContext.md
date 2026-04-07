# Active Context — Ragtooth

## Current Focus
v1.1.5 is ready. All 90 tests passing. Now ready for marketing/landing page improvements.

## What's Done (as of 2026-04-06)

### Algorithm Fixes (v1.1.x series)
- **getBoundingClientRect for word measurement**: switched from `offsetWidth` to `getBoundingClientRect().width` for subpixel precision; added `white-space:nowrap` on all word spans before measurement to prevent hyphen-break width inflation
- **Leading space correction**: word spans include leading whitespace in measured width but `trimLineStart` strips it visually. Fixed by measuring space width via `spaceProbe` element and deducting at line starts (`effectiveWidth`).
- **spaceProbe class**: probe uses `RAG_CLASSES.spaceProbe` (`rag-space-probe`) distinct from `rag-word`, so mocks can return 0 for it (avoids spaceWidth=wordWidth collapse in tests)
- **TreeWalker → childNodes traversal**: `createTreeWalker(SHOW_TEXT)` does not descend into `<em>`/`<strong>` in happy-dom; replaced with recursive `childNodes` walk. Words collected during Pass 3 and passed directly to Pass 4 (avoids querySelectorAll too)
- **Bottom-align oscillation fix**: loop detects N/N+1 oscillation and picks smaller value

### Demo Site Additions
- Cursor mode on demo: mouse X→sawDepth, mouse Y→maxTracking, Esc to exit, `?` toggle button
- Vanilla JS usage example (3rd CodeBlock on landing page)
- Custom syntax highlighter in `CodeBlock.tsx` (bold keywords, italic strings, muted punctuation — replaced sugar-high)
- Two-column "What is sawtooth rag?" section: `grid-cols-1 sm:grid-cols-2` responsive
- Options table: hover highlight `hover:bg-white/5`
- CopyInstall: clipboard error handling (catch no-op)

### Test Suite
- 90 tests passing (was 85 failing 5)
- `mockOffsetWidth` and `mockOffsetWidthByClass` both mock BCR alongside offsetWidth
- Both mocks return 0 for `RAG_CLASSES.spaceProbe` class
- New suites: inline element preservation, sawDepth edge cases, getCleanHTML on pristine input, container fallback

## Deploy Pipeline
- Two remotes: `origin` (quitequinn) + `deploy` (github-liiift → Vercel)
- Version bump committed as Liiift, pushed to `deploy` to trigger Vercel build
- Current version: 1.1.5

## Immediate Next Steps
- Marketing: improve landing page copy/sections
- Consider: CHANGELOG, GitHub release notes
