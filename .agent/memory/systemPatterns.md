# System Patterns — Rag-Rub

## Status
Architecture decided. Patterns will be fully filled in once CodePen algorithm is reviewed.

## Package Layer Architecture

```
rag-rub/
├── src/core/         — pure algorithm (no React, no DOM where avoidable)
│   ├── analyze.ts    — measure line widths, identify problem lines
│   └── adjust.ts     — insert &shy;/&nbsp; to reshape rag
├── src/react/        — React bindings
│   ├── useRag.ts     — hook: attaches core to a ref, wires ResizeObserver
│   └── RagText.tsx   — component: thin wrapper around useRag
└── src/index.ts      — public exports
```

## Expected Core Flow

```
Mount / container resize
    ↓
Analyze — measure rendered line widths via Range API or offsetWidth
    ↓
Identify bad lines — lines significantly shorter/longer than target rag shape
    ↓
Adjust — insert soft hyphens / non-breaking spaces into text nodes
    ↓
Re-render — React sees updated text, browser reflows
    ↓
ResizeObserver fires again if container changed → loop
```

## Key Concerns
- **DOM reflow**: adjustments must trigger re-measurement; need to avoid layout thrashing
- **Font dependency**: rag shape is font- and size-specific; adjustments must re-run when font changes
- **Reversibility**: inserted characters must be easy to strip out (clean export option)

## CodePen Algorithm (source of truth — reviewed 2026-04-04)

### What it does
Creates a deliberate **alternating-line zigzag rag**: odd lines run near full column width, even lines are shortened by `ragDifference` (default 80px). Slack on each line is distributed as `letter-spacing` to avoid loose gaps.

### Four-pass pipeline
1. **Reset** — restore original innerHTML snapshot (idempotency)
2. **Widow removal** — replace last space in each `<p>` with `&nbsp;` via regex
3. **Word wrap** — wrap every word token in `<span class="word">` to make them measurable
4. **Line grouping** — walk word spans, accumulate `offsetWidth`, break when `idealWidth` is reached; inject hidden `<span class="line-info" data-ideal-width data-line-width>` sentinel at each line end
5. **Tracking adjustment** — for each `.line-info`, compute `(idealWidth - lineWidth) / charCount` px of letter-spacing; clamp to `acceptableTracking` max

### Key DOM APIs used
- `element.offsetWidth` — measures rendered pixel width (forces layout reflow; must be live in DOM)
- `element.innerHTML` getter/setter — used for reset, word-wrap injection, and line rebuild
- `element.textContent.length` — character count for tracking formula
- `element.style.letterSpacing` — applies computed tracking per line

### Exposed options
| Option | Default | Meaning |
|---|---|---|
| `ragDifference` | `80` (px) | How much shorter even lines are vs. odd lines |
| `acceptableTracking` | `0.7` (px) | Max letter-spacing per line |

### Design constraints that affect porting
- **Must be live in DOM** — `offsetWidth` does not work on detached elements
- **Idempotency requires original snapshot** — must preserve original text before first run
- **innerHTML mutation** — conflicts with React's virtual DOM; need a ref-based approach
- **Reflow cost** — reads `offsetWidth` on every word on every call; must batch reads before writes and debounce on resize

## Patterns TBD
- Component/hook API shape (informed by above)
- Whether to use `Range` API as a more precise alternative to `offsetWidth` per word
