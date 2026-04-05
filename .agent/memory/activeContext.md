# Active Context — Rag-Rub

## Current Focus
Project initialization. Converting a CodePen prototype into a proper standalone repo.

## What's Done
- README written with prior art links
- `.claude/` directory initialized (settings, commands, research)
- `.agent/` memory files initialized

## Immediate Next Steps
1. Review the original CodePen to understand current logic
2. Decide on tech stack (vanilla JS? React/Next.js? Vite?)
3. Scaffold the project structure
4. Port the CodePen logic into the new structure

## Open Questions
- What exactly does the CodePen algorithm do? (review before porting)
- Package name on npm — `rag-rub`? `ragadjust`? `react-rag`?
- Should there also be a demo/docs site alongside the package?

## Recent Decisions
- **2026-04-04**: `.claude/` and `.agent/` initialized before any code — memory-first approach
- **2026-04-04**: Package type decided — npm module, React-first (hook + component), vanilla JS core, Vite library mode build, TypeScript
