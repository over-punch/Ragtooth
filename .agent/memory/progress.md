# Progress — Ragtooth

## What Works Today
- `ragtooth` npm package published (v0.1.1)
- Core saw-rag algorithm fully ported and tested (12 tests passing)
- React hook (`useRag`) with ResizeObserver, width-only resize check, auto content tracking
- React component (`RagText`) with auto string-children snapshot tracking
- Vanilla JS API (`applyRag`, `removeRag`, `getCleanHTML`)
- Next.js landing site with interactive demo deployed to Vercel via Liiift remote
- `deploy` and `cleanup` Claude skills configured and working

## What's Left to Build
- [ ] Publish updated package to npm (currently only v0.1.0 is on registry; v0.1.1 improvements not yet re-published)
- [ ] Address GitHub security vulnerabilities (9 flagged in devDependencies)
- [ ] Export feature (copy adjusted HTML snippet)
- [ ] Docs page or expanded site content

## Known Issues
- GitHub Dependabot flagging 9 vulnerabilities (2 critical, 3 high, 4 moderate) in devDependencies

## Decision Log
- **2026-04-04**: Project initialized from CodePen prototype. Memory-first setup.
- **2026-04-05**: Renamed from rag-rub to Ragtooth; first npm publish at v0.1.0
- **2026-04-05**: React/react-dom marked optional peer deps; performance + robustness improvements landed in v0.1.1
- **2026-04-05**: Deploy pipeline wired: Liiift-Studio/Ragtooth → Vercel
