# System Patterns — Ragtooth

## Architecture

```
ragtooth/
├── src/
│   ├── core/
│   │   ├── adjust.ts     — 5-pass saw-rag algorithm (framework-agnostic DOM mutation)
│   │   ├── resolve.ts    — RagValue unit converter (px, %, em, rem, ch)
│   │   └── types.ts      — RagOptions, RagValue, RAG_CLASSES
│   ├── react/
│   │   ├── useRag.ts     — hook: snapshot → applyRag on mount/resize/options change
│   │   └── RagText.tsx   — forwardRef component wrapping useRag
│   └── index.ts          — public exports
└── site/                 — Next.js 16 landing site
```

## The 5-Pass Algorithm (`applyRag`)

1. **Reset** — `container.innerHTML = originalHTML` (idempotent; snapshot taken once at mount)
2. **Widow removal** — regex replaces last space in each block with `\u00a0` to prevent orphaned last words
3. **Word wrap** — `TreeWalker` walks text nodes; each word gets a `<span class="rag-word">` measurement span. Trailing whitespace of the last word in each text node is included in that span (prevents orphan spaces at inline-element boundaries like `"of "` before `<strong>`).
4. **Line grouping** (read then write):
   - Read: `offsetWidth` of each word span + build contextual HTML wrapping each word in its ancestor inline elements (preserves `<em>`, `<strong>`, etc. across line breaks)
   - Write: accumulate widths; break when `lineWidth ≥ idealWidth`. Each line becomes `display:inline-block;white-space:nowrap`. Leading whitespace stripped from first word of every line (CSS collapses it anyway).
   - `sawAlign:'bottom'` does a pre-count pass to get total lines, then anchors short-line positions from the end
5. **Tracking** — hidden `<span class="rag-line-info" data-ideal-width data-line-width>` sentinels store per-line measurements; Pass 5 reads them and applies `letter-spacing` capped at `maxTracking`

## Key Invariants
- `originalHTML` snapshot is taken once at mount via `getCleanHTML(container)` (strips any prior rag markup before snapshotting)
- Algorithm is pure DOM mutation — no React state, no re-renders
- ResizeObserver skips re-runs when only height changes (width-only check)
- All CSS classes injected by the algorithm are in `RAG_CLASSES` constant (exported for consumer targeting/reset)

## RagValue Resolution (`resolve.ts`)
- Plain number → pixels
- String with unit: `px` (identity), `%` (of containerWidth), `em` (× fontSize), `rem` (× rootFontSize), `ch` (× chWidth, measured via probe span)
- Returns 0 on NaN; input is clamped `≥ 0` at call site

## React Hook (`useRag`)
- `useLayoutEffect` runs after every render (options deps + contentKey)
- Takes `originalHTML` snapshot on first run via `getCleanHTML`
- Resets snapshot when `contentKey` changes (handles string children changing)
- ResizeObserver debounced via `requestAnimationFrame`
- Returns `RefObject<HTMLElement | null>`

## Inline Element Preservation Pattern (Pass 4)
Each word's HTML is wrapped in ancestor inline elements by walking up the DOM tree:
```typescript
let ancestor = word.parentElement
while (ancestor && ancestor !== element) {
    const shallow = ancestor.cloneNode(false) as Element
    const shallowHTML = shallow.outerHTML
    const split = shallowHTML.lastIndexOf('</')
    html = shallowHTML.slice(0, split) + html + shallowHTML.slice(split)
    ancestor = ancestor.parentElement
}
```
A line break between two words inside the same `<em>` produces two adjacent `<em>` elements — semantically split but visually identical.
