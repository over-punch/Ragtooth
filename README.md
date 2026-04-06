# Ragtooth

Deliberate sawtooth rag for the web.

Most tools try to smooth your rag. Ragtooth does the opposite — it shapes your text into a deliberate sawtooth pattern, alternating long and short lines to create a clean, intentional right edge. A typographic technique used in editorial and book design, now available for the web.

---

## Install

```bash
npm install ragtooth
```

React 17+ is an optional peer dependency (only needed if you use `RagText` or `useRag`).

---

## Usage

### `<RagText>` component

```tsx
import { RagText } from 'ragtooth'

export default function Article() {
  return (
    <RagText sawDepth={120} sawPeriod={2} maxTracking={0.7}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit...
    </RagText>
  )
}
```

### `useRag` hook

For more control, attach the hook to any element via ref:

```tsx
import { useRag } from 'ragtooth'

export default function Paragraph({ children }) {
  const { ref } = useRag({ sawDepth: 120, sawPeriod: 2 })
  return <p ref={ref}>{children}</p>
}
```

### Vanilla JS (no React)

```ts
import { applyRag, removeRag } from 'ragtooth'

const el = document.querySelector('p')
const original = el.innerHTML

applyRag(el, original, { sawDepth: 120, sawPeriod: 2 })

// Restore original markup
removeRag(el, original)
```

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `sawDepth` | `RagValue` | `80` | How far short lines are pulled in. Higher = more pronounced sawtooth. |
| `sawPeriod` | `number` | `2` | Lines per cycle. `2` = classic alternating saw. `3` = two full then one short. |
| `sawPhase` | `number` | `sawPeriod` | Which line within each cycle is shortened (1-indexed). Default is the last line of each cycle. |
| `sawAlign` | `'top' \| 'bottom'` | `'top'` | Anchor the cycle to the top or bottom of the block. `'bottom'` with `sawPeriod: 3` keeps the last two lines full, eliminating the awkward short-penultimate-line effect. |
| `maxTracking` | `RagValue` | `0.7` | Maximum `letter-spacing` per line. Prevents short lines from being stretched grotesquely. |

### RagValue

`sawDepth` and `maxTracking` accept a plain number (pixels) or a string with a unit:

| Value | Meaning |
|---|---|
| `80` | 80 px |
| `"80px"` | 80 px (explicit) |
| `"20%"` | 20% of the container's width |
| `"2em"` | 2× the element's computed font-size |
| `"1rem"` | 1× the root font-size |
| `"5ch"` | 5× the width of the `0` glyph in the element's font |

---

## How it works

The algorithm runs five passes on the target element:

1. **Reset** — restore the element to its original HTML snapshot
2. **Widow removal** — replace the last space in each block with `&nbsp;` to prevent orphaned final words
3. **Word wrap** — walk all text nodes via `TreeWalker`, wrapping each word in a measurement `<span>` while preserving inline elements (`<em>`, `<strong>`, `<a>`, etc.)
4. **Line grouping** — walk word spans, accumulate pixel widths, break into `display:inline-block` line spans separated by `<br>`; every nth line (controlled by `sawPeriod` and `sawPhase`) is shortened by `sawDepth`
5. **Tracking** — distribute per-line slack as `letter-spacing`, capped at `maxTracking`

DOM reads are batched before writes to avoid layout thrashing. A `ResizeObserver` (debounced via `requestAnimationFrame`) re-runs the algorithm when the container width changes.

---

## Notes

- **SSR safe** — all DOM access is gated on `typeof window !== 'undefined'`; the package will not crash in Node/SSR environments
- **Dynamic content** — `RagText` auto-tracks string children and re-snapshots on change. For non-string JSX children that change dynamically, pass a `key` prop to force remount: `<RagText key={id}>{content}</RagText>`
- **Font dependency** — rag shape is font- and size-specific; the algorithm re-runs on resize but not on font-load events. Ensure fonts are loaded before mount or trigger a resize.
- **Inline elements** — `<em>`, `<strong>`, `<a>`, and other inline wrappers are preserved through the algorithm; bold and italic context is maintained at every line break
- **`sawAlign: 'bottom'`** — uses a pre-count pass to estimate total lines, then anchors the shortened-line cycle from the bottom up. Combine with `sawPeriod: 3, sawPhase: 1` for the classic pattern with guaranteed full-width last two lines

---

## Prior art

- [ragadjust](https://github.com/nathanford/ragadjust) — original jQuery plugin (primary inspiration)
- [ragadjust fork](https://github.com/aperfect/ragadjust)
- [jekyll-ragadjust](https://github.com/eulenherr/jekyll-ragadjust)
- [grunt-raggedast](https://github.com/adamhavel/grunt-raggedast)
- [wp_php_ragadjust](https://github.com/arnoesterhuizen/wp_php_ragadjust)

---

## License

MIT
