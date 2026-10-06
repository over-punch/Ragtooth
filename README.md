# Ragtooth

[![npm](https://img.shields.io/npm/v/%40overpunch%2Fragtooth.svg)](https://www.npmjs.com/package/@overpunch/ragtooth) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/over-punch/type-tools)

A sawtooth rag, on the web. Shapes text into alternating long/short lines — the kind of typographic rhythm that reads as design, not accident.

The *rag* is the uneven right edge of unjustified text. Left to the browser it falls where it falls. Ragtooth measures each natural line and reshapes that edge into a deliberate, repeating zig-zag — short line, full line, short line — so the paragraph looks composed instead of accidental.

![Before and after: the same paragraph with a natural ragged right edge on the left, and ragtooth's deliberate alternating long/short sawtooth on the right.](https://raw.githubusercontent.com/over-punch/Ragtooth/main/assets/hero.png?v=1)

**[ragtooth.com](https://ragtooth.com)** · [npm](https://www.npmjs.com/package/@overpunch/ragtooth) · [GitHub](https://github.com/over-punch/Ragtooth)

TypeScript · Zero dependencies · ~3.3 kB min+gzip · React + Vanilla JS

---

## Install

```bash
npm install @overpunch/ragtooth
```

## React

### Component

```tsx
import { RagText } from '@overpunch/ragtooth'

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
import { useRag } from '@overpunch/ragtooth'

const { ref } = useRag({ sawDepth: 120, sawPeriod: 2 })

<p ref={ref}>Your paragraph text here...</p>
```

`useRag` returns `{ ref }` — destructure it and attach `ref` to any block element. Re-runs on resize automatically.

## Vanilla JS

```ts
import { applyRag, removeRag } from '@overpunch/ragtooth'

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

Ragtooth measures every word's width (wrapping each word in a span), then sets its own line breaks by adding up those widths:

- **Long lines** — fill up to the container's content width
- **Short lines** — every `sawPeriod`-th line breaks earlier, at `content width − sawDepth`
- **Tracking** — each line except a paragraph's last is filled out with `letter-spacing`, up to `maxTracking`
- **No widows** — the last two words of each block stay together

Each line is then locked (`white-space: nowrap`, a `<br>` after it). Because Ragtooth chooses the breaks, they differ from the browser's: a paragraph usually gains a line or more (10–27% taller in our tests at body sizes). Words still break after hyphens; a single word wider than the column wraps only if your CSS allows breaking inside words (`overflow-wrap`).

**Markup:** inline elements (`<em>`, `<a>`, `<strong>`…), your own `<br>` and images, and the spaces between elements are kept, and the original elements are reused, so event listeners on them (React's included) keep working. An element that runs across a line break is split into one copy per line (a link over two lines becomes two links; only the first keeps its `id`). `getCleanHTML()` returns the original markup. Nested blocks are handled: in `<li><p>…</p></li>` the `<p>` is ragged.

**Limits:**
- Ragtooth makes ragged text, so `text-align: justify` is overridden, and `white-space: pre` is not supported.
- At large sizes (few words per line) the pattern can invert: a long line can't always be longer than a short one.
- Lines are measured with the fonts loaded at the time. The React hook re-runs after `document.fonts.ready`; with the vanilla API, call `applyRag` again once fonts load.

`ResizeObserver` (React hook, Webflow embed) re-runs on any container width change. Calling `applyRag` again is safe — it resets to the original content before re-measuring, so repeated calls (e.g. on resize) never compound, even if you pass the element's current, already-ragged `innerHTML`.

---

## Accessibility

Ragtooth shapes the *visual* edge of a paragraph; the reading order, words, and text content are unchanged. A few things worth knowing because the effect works by mutating the DOM:

- **Word wrapping.** Each word is wrapped in an inline `<span>`; the spaces between words are kept, so the text reads as before. Injected line breaks are `aria-hidden`, but copied text includes a line break at each line end.
- **Links.** A link that wraps across lines becomes one link per line, which a screen reader announces separately. Keep links short, or leave such text unragged.
- **Letter-spacing.** Short lines are filled with `letter-spacing` up to `maxTracking`. Keep `maxTracking` modest (the `0.7` default is conservative) so spacing stays within comfortable reading limits — this respects [WCAG 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG21/Understand/text-spacing.html), which expects text to remain readable when users override spacing.
- **Reset for export.** `getCleanHTML(el)` returns the markup with every injected span removed — use it before serialising, copying, or persisting content so you store clean HTML, not instrumented markup.
- **Best on body copy.** Like all rag shaping, it reads best on left-aligned, unjustified prose. It is decorative: if `letter-spacing` is set very high it can hurt legibility, so tune `sawDepth`/`maxTracking` to taste.

---

## Compatibility

- **Browsers** — any evergreen browser. Relies on [`ResizeObserver`](https://caniuse.com/resizeobserver) and [`document.fonts.ready`](https://caniuse.com/mdn-api_fontfaceset_ready), both supported in Chrome/Edge 64+, Firefox 69+, and Safari 11.1+.
- **SSR** — the core guards on `typeof window` and no-ops on the server; the React entry points need a browser (see [Next.js](#nextjs)).
- **React** — optional peer dependency, `react`/`react-dom` `>=17`. The main entry also exports the hook and component, so it imports `react`; without React installed, import the vanilla API from `@overpunch/ragtooth/core`.
- **Size** — ~3.3 kB min+gzip, zero runtime dependencies.

---

## Options

**Recommended starting point:** `sawDepth: 120, sawPeriod: 2` for body copy at a comfortable measure (~60–75 characters), then tune `sawDepth` up for a more dramatic zig-zag or down for a subtler one. Leave the rest at their defaults to begin with.

| Option | Type | Default | Description |
|---|---|---|---|
| `sawDepth` | `RagValue` | `80` | How far short lines are pulled in from full width. Higher = more pronounced sawtooth. |
| `sawPeriod` | `number` | `2` | Lines per saw cycle. `2` = alternating long/short. `3` = two long, one short. `4` = three long, one short. |
| `sawPhase` | `number` | `sawPeriod` | Which line in each cycle is shortened (1-indexed). Default = last line. |
| `sawAlign` | `'top' \| 'bottom'` | `'top'` | Whether the cycle is anchored from the top or bottom of the block. `'bottom'` counts the cycle from the last line, so the lines just before the end are never the shortened ones. |
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
// Count the cycle from the end, so the closing lines aren't the shortened ones
applyRag(el, el.innerHTML, {
  sawDepth: 100,
  sawPeriod: 3,
  sawAlign: 'bottom',
})
// Period of 3 from the bottom: lines count as [short, full, full] per group
// → the penultimate line is never shortened (the last line holds whatever words remain)
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
import { applyRag, removeRag, getCleanHTML } from '@overpunch/ragtooth'
import type { RagOptions, RagValue } from '@overpunch/ragtooth'

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
import { RagText } from '@overpunch/ragtooth'
```

---

## Development

```bash
git clone https://github.com/over-punch/Ragtooth.git
cd Ragtooth
npm install

npm run build      # bundle to dist/ (Vite, ESM + CJS + .d.ts)
npm test           # run the unit tests (Vitest, happy-dom)
npm run typecheck  # tsc --noEmit
npm run capture    # regenerate the README hero image (assets/hero.png)
```

The source is organised the same way as the rest of the [type-tools](https://github.com/over-punch/type-tools) suite:

- `src/core/` — the framework-agnostic algorithm (`adjust.ts`), options resolver (`resolve.ts`), and shared types. No React imports.
- `src/react/` — the `useRag` hook and `RagText` component.
- `src/__tests__/` — Vitest unit tests for the core, resolver, types, and React layers.

Issues and PRs are welcome at [github.com/over-punch/Ragtooth](https://github.com/over-punch/Ragtooth/issues).

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.
