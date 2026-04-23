# Ragtooth

[![npm](https://img.shields.io/npm/v/ragtooth.svg)](https://www.npmjs.com/package/ragtooth) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/Liiift-Studio/type-tools)

A sawtooth rag, on the web. Shapes text into alternating long/short lines — the kind of typographic rhythm that reads as design, not accident.

**[ragtooth.com](https://ragtooth.com)** · [npm](https://www.npmjs.com/package/ragtooth) · [GitHub](https://github.com/Liiift-Studio/Ragtooth)

TypeScript · Zero dependencies · React + Vanilla JS

---

## Install

```bash
npm install ragtooth
```

## React

### Component

```tsx
import { RagText } from 'ragtooth'

<RagText sawDepth={120} sawPeriod={2}>
  Your paragraph text here...
</RagText>
```

### Hook

```tsx
import { useRag } from 'ragtooth'

const ref = useRag({ sawDepth: 120, sawPeriod: 2 })

<p ref={ref}>Your paragraph text here...</p>
```

`useRag` returns a ref to attach to any block element. Re-runs on resize automatically.

## Vanilla JS

```ts
import { applyRag, removeRag } from 'ragtooth'

const el = document.querySelector('p')
const originalHTML = el.innerHTML

// Apply the rag
applyRag(el, originalHTML, { sawDepth: 120, sawPeriod: 2 })

// Remove it (restores original HTML)
removeRag(el, originalHTML)
```

Wait for fonts before measuring:

```ts
await document.fonts.ready
applyRag(el, el.innerHTML, { sawDepth: 120 })
```

---

## How it works

Ragtooth measures each line's natural width by wrapping every word in a span, reading their `offsetWidth`, and grouping them into lines. It then applies `max-width` and `letter-spacing` to each line element to produce the sawtooth rhythm:

- **Long lines** — stay at full container width
- **Short lines** — constrained to `containerWidth − sawDepth`, with `letter-spacing` added to fill that reduced width

The algorithm never changes how text flows. It reads the browser's natural line breaks, then constrains them. `ResizeObserver` re-runs on any container width change.

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `sawDepth` | `RagValue` | `80` | How far short lines are pulled in from full width. Higher = more pronounced sawtooth. |
| `sawPeriod` | `number` | `2` | Lines per saw cycle. `2` = alternating long/short. `3` = two long, one short. `4` = three long, one short. |
| `sawPhase` | `number` | `sawPeriod` | Which line in each cycle is shortened (1-indexed). Default = last line. |
| `sawAlign` | `'top' \| 'bottom'` | `'top'` | Whether the cycle is anchored from the top or bottom of the block. `'bottom'` guarantees the last lines are full-width. |
| `maxTracking` | `RagValue` | `0.7` | Maximum `letter-spacing` any line can receive. Prevents grotesque stretching on very short lines. |
| `resize` | `boolean` | `true` | Whether to re-run when the container resizes. Set to `false` for static contexts. |

### RagValue

All size options (`sawDepth`, `maxTracking`) accept a `RagValue` — a number or a CSS-like string:

| Input | Resolves to |
|---|---|
| `80` | 80px |
| `"80px"` | 80px |
| `"20%"` | 20% of container width |
| `"2em"` | 2× the element's computed font-size |
| `"1rem"` | 1× the root font-size |
| `"5ch"` | 5× the width of the "0" glyph |

### sawAlign examples

```ts
// Guarantee the paragraph ends with two full-width lines
applyRag(el, el.innerHTML, {
  sawDepth: 100,
  sawPeriod: 3,
  sawAlign: 'bottom',
})
// Period of 3 from the bottom: lines count as [short, full, full] per group
// → the penultimate line is always full
```

### sawPhase examples

```ts
// sawPeriod: 3, sawPhase: 2
// → pattern per 3-line group: [full, SHORT, full]
applyRag(el, el.innerHTML, { sawPeriod: 3, sawPhase: 2 })
```

---

## TypeScript

```ts
import { applyRag, removeRag, getCleanHTML } from 'ragtooth'
import type { RagOptions, RagValue } from 'ragtooth'

const options: RagOptions = {
  sawDepth: '15%',
  sawPeriod: 3,
  sawAlign: 'bottom',
  maxTracking: '0.05em',
}
```

---

## API reference

| Export | Description |
|---|---|
| `applyRag(el, originalHTML, options?)` | Applies the sawtooth rag to `el`. |
| `removeRag(el, originalHTML)` | Restores `el` to its original HTML. |
| `getCleanHTML(el)` | Returns the element's current HTML with all injected spans removed. |
| `useRag(options?)` | React hook — returns a ref. Attaches, measures, and re-runs on resize. |
| `RagText` | React component wrapper around `useRag`. |
| `RagOptions` | TypeScript interface for all options. |
| `RagValue` | Type for size options (`number \| string`). |
| `RAG_CLASSES` | Object of CSS class names injected by the algorithm (`rag-word`, `rag-line`, etc.). |

---

## Next.js

`RagText` and `useRag` require a browser environment. Add `"use client"` to any component that uses them:

```tsx
"use client"
import { RagText } from 'ragtooth'
```

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.
