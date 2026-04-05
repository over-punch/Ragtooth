# Ragtooth

Deliberate saw rag for the web.

Most tools try to smooth your rag. Ragtooth does the opposite — it shapes your text into a deliberate sawtooth pattern, alternating long and short lines to create a clean, intentional right edge. A typographic technique used in editorial and book design, now available for the web.

---

## Install

```bash
npm install ragtooth
```

React 17+ is a peer dependency.

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
| `sawDepth` | `number` | `80` | How many pixels shorter the short lines are. Higher = more pronounced sawtooth. |
| `sawPeriod` | `number` | `2` | How many lines per cycle. `2` = every other line (classic saw), `3` = two full then one short. |
| `maxTracking` | `number` | `0.7` | Maximum `letter-spacing` in pixels per line. Prevents short lines being stretched too wide. |

---

## How it works

The algorithm runs five passes on the target element:

1. **Reset** — restore the element to its original HTML snapshot
2. **Widow removal** — replace the last space in each block with `&nbsp;` to prevent orphaned final words
3. **Word wrap** — wrap every word in a measurement `<span>`
4. **Line grouping** — walk word spans, accumulate pixel widths, break into line spans; every nth line (controlled by `sawPeriod`) is shortened by `sawDepth` pixels
5. **Tracking** — distribute per-line slack as `letter-spacing`, capped at `maxTracking`

DOM reads are batched before writes to avoid layout thrashing. A `ResizeObserver` (debounced via `requestAnimationFrame`) re-runs the algorithm when the container width changes.

---

## Notes

- **SSR safe** — all DOM access is gated; the package will not crash in Node/SSR environments
- **Dynamic content** — if `children` change, pass a new `key` prop to force remount and re-snapshot: `<RagText key={content}>{content}</RagText>`
- **Font dependency** — rag shape is font- and size-specific; the adjustment re-runs automatically on resize but not on font changes

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
