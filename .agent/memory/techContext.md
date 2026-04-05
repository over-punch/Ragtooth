# Tech Context — Rag-Rub

## Decided Stack
**npm package with React-first API** — decided 2026-04-04.

## Architecture
- **Core layer**: Framework-agnostic vanilla JS algorithm (pure functions, no DOM deps where possible)
- **React layer**: Hooks + components wrapping the core — `useRag()` hook, `<RagText>` component
- **Build**: Vite (library mode) to produce ESM + CJS outputs
- **TypeScript**: Yes — for type safety and good DX in consuming projects

## Package API Goals
```ts
// Hook usage
const { ref } = useRag(options)
<p ref={ref}>{children}</p>

// Component usage
<RagText options={options}>Long paragraph of text...</RagText>
```

## Performance Priorities
- Core algorithm must not cause layout thrashing (batch DOM reads before writes)
- Use `ResizeObserver` to re-run only when container width changes
- Debounce/throttle recalculation on resize
- No unnecessary re-renders — memo/ref patterns over state where possible

## Origin Stack (CodePen)
- HTML / CSS / Vanilla JavaScript — algorithm to be ported from here

## Known Constraints
- Rag adjustment is inherently font/size/container-dependent → must run in the browser
- SSR-safe: package must not crash in Node/SSR environments (guard all DOM access)
- Soft hyphens (`&shy;`) and `&nbsp;` must survive framework rendering pipelines cleanly
