# Ragtooth

[![npm](https://img.shields.io/npm/v/%40liiift-studio%2Fragtooth.svg)](https://www.npmjs.com/package/@liiift-studio/ragtooth) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/Liiift-Studio/type-tools)

A sawtooth rag, on the web. Shapes text into alternating long/short lines — the kind of typographic rhythm that reads as design, not accident.

The *rag* is the uneven right edge of unjustified text. Left to the browser it falls where it falls. Ragtooth measures each natural line and reshapes that edge into a deliberate, repeating zig-zag — short line, full line, short line — so the paragraph looks composed instead of accidental.

![Before and after: the same paragraph with a natural ragged right edge on the left, and ragtooth's deliberate alternating long/short sawtooth on the right.](https://raw.githubusercontent.com/Liiift-Studio/Ragtooth/main/assets/hero.png?v=1)

**[ragtooth.com](https://ragtooth.com)** · [npm](https://www.npmjs.com/package/@liiift-studio/ragtooth) · [GitHub](https://github.com/Liiift-Studio/Ragtooth)

TypeScript · Zero dependencies · ~3.3 kB min+gzip · React + Vanilla JS

---

## Install

```bash
npm install @liiift-studio/ragtooth
```

## React

### Component

```tsx
import { RagText } from '@liiift-studio/ragtooth'

<RagText sawDepth={120} sawPeriod={2}>
  Your paragraph text here...
</RagText>
```

`RagText` renders a `<p>` by default and forwards every standard HTML attribute, so `className`, `style`, `id`, `aria-*`, and `data-*` pass straight through — no wrapper element needed:

```tsx
<RagText as="h2" className="lede" sawDepth={40}>
  A heading with a shaped rag
</RagText>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `ElementType` | `"p"` | The element to render. |
| `children` | `ReactNode` | — | The text to shape. String children are re-measured automatically when they change — no `key` prop required. For JSX children that change, pass a `key`. |
| *(all `RagOptions`)* | — | — | `sawDepth`, `sawPeriod`, `sawPhase`, `sawAlign`, `maxTracking`, `resize` — see [Options](#options). |
| *(any HTML attribute)* | — | — | `className`, `style`, `id`, `aria-*`, `data-*`, etc. are forwarded to the rendered element. |

### Hook

```tsx
import { useRag } from '@liiift-studio/ragtooth'

const { ref } = useRag({ sawDepth: 120, sawPeriod: 2 })

<p ref={ref}>Your paragraph text here...</p>
```

`useRag` returns `{ ref }` — destructure it and attach `ref` to any block element. Re-runs on resize automatically.

## Vanilla JS

```ts
import { applyRag, removeRag } from '@liiift-studio/ragtooth'

const el = document.querySelector('p')
const originalHTML = el.innerHTML

// Apply the rag
applyRag(el, originalHTML, { sawDepth: 120, sawPeriod: 2 })

// Remove it (restores original HTML)
removeRag(el, originalHTML)
```

Wait for fonts before measuring:

```ts
const originalHTML = el.innerHTML
await document.fonts.ready
applyRag(el, originalHTML, { sawDepth: 120 })
```

Capture `originalHTML` before any mutation so the `fonts.ready` call receives clean HTML, not the previously-instrumented markup.

---

## How it works

Ragtooth measures each line's natural width by wrapping every word in a span, reading their `offsetWidth`, and grouping them into lines. It then applies `max-width` and `letter-spacing` to each line element to produce the sawtooth rhythm:

- **Long lines** — stay at full container width
- **Short lines** — constrained to `containerWidth − sawDepth`, with `letter-spacing` added to fill that reduced width

The algorithm never changes how text flows. It reads the browser's natural line breaks, then constrains them. `ResizeObserver` re-runs on any container width change.

Calling `applyRag` again is safe — it resets to the supplied `originalHTML` before re-measuring, so repeated calls (e.g. on resize) never compound.

---

## Accessibility

Ragtooth shapes the *visual* edge of a paragraph; the reading order, words, and text content are unchanged. A few things worth knowing because the effect works by mutating the DOM:

- **Word wrapping.** Each word is wrapped in an inline `<span>` to measure it. Inline spans don't introduce new word boundaries, so screen readers still announce the paragraph as continuous text.
- **Letter-spacing.** Short lines are filled with `letter-spacing` up to `maxTracking`. Keep `maxTracking` modest (the `0.7` default is conservative) so spacing stays within comfortable reading limits — this respects [WCAG 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG21/Understand/text-spacing.html), which expects text to remain readable when users override spacing.
- **Reset for export.** `getCleanHTML(el)` returns the markup with every injected span removed — use it before serialising, copying, or persisting content so you store clean HTML, not instrumented markup.
- **Best on body copy.** Like all rag shaping, it reads best on left-aligned, unjustified prose. It is decorative: if `letter-spacing` is set very high it can hurt legibility, so tune `sawDepth`/`maxTracking` to taste.

---

## Compatibility

- **Browsers** — any evergreen browser. Relies on [`ResizeObserver`](https://caniuse.com/resizeobserver) and [`document.fonts.ready`](https://caniuse.com/mdn-api_fontfaceset_ready), both supported in Chrome/Edge 64+, Firefox 69+, and Safari 11.1+.
- **SSR** — the core guards on `typeof window` and no-ops on the server; the React entry points need a browser (see [Next.js](#nextjs)).
- **React** — optional peer dependency, `react`/`react-dom` `>=17`. The vanilla API has no peer deps at all.
- **Size** — ~3.3 kB min+gzip, zero runtime dependencies.

---

## Options

**Recommended starting point:** `sawDepth: 120, sawPeriod: 2` for body copy at a comfortable measure (~60–75 characters), then tune `sawDepth` up for a more dramatic zig-zag or down for a subtler one. Leave the rest at their defaults to begin with.

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
import { applyRag, removeRag, getCleanHTML } from '@liiift-studio/ragtooth'
import type { RagOptions, RagValue } from '@liiift-studio/ragtooth'

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
| `useRag(options?)` | React hook — returns `{ ref }`. Attach `ref` to any block element. Measures and re-runs on resize. |
| `RagText` | React component wrapper around `useRag`. |
| `RagOptions` | TypeScript interface for all options. |
| `RagValue` | Type for size options (`number \| string`). |
| `RAG_CLASSES` | Object of CSS class names injected by the algorithm (`rag-word`, `rag-line`, etc.). |

---

## Next.js

`RagText` and `useRag` require a browser environment. Add `"use client"` to any component that uses them:

```tsx
"use client"
import { RagText } from '@liiift-studio/ragtooth'
```

---

## Development

```bash
git clone https://github.com/Liiift-Studio/Ragtooth.git
cd Ragtooth
npm install

npm run build      # bundle to dist/ (Vite, ESM + CJS + .d.ts)
npm test           # run the unit tests (Vitest, happy-dom)
npm run typecheck  # tsc --noEmit
npm run capture    # regenerate the README hero image (assets/hero.png)
```

The source is organised the same way as the rest of the [type-tools](https://github.com/Liiift-Studio/type-tools) suite:

- `src/core/` — the framework-agnostic algorithm (`adjust.ts`), options resolver (`resolve.ts`), and shared types. No React imports.
- `src/react/` — the `useRag` hook and `RagText` component.
- `src/__tests__/` — Vitest unit tests for the core, resolver, types, and React layers.

Issues and PRs are welcome at [github.com/Liiift-Studio/Ragtooth](https://github.com/Liiift-Studio/Ragtooth/issues).

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.
