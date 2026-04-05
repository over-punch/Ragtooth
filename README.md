# rag-rub

A typographic tool to adjust the shape of text's rag.

"Rag" is the uneven right edge of left-aligned text. Left unchecked it can look notched, staircased, or jagged. `rag-rub` creates a deliberate alternating-line zigzag pattern — odd lines run near full column width, even lines are intentionally shorter — and distributes the slack as `letter-spacing` so nothing looks loose.

---

## Install

```bash
npm install rag-rub
```

React 17+ is a peer dependency.

---

## Usage

### `<RagText>` component

```tsx
import { RagText } from 'rag-rub'

export default function Article() {
  return (
    <RagText ragDifference={80} maxTracking={0.7}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit...
    </RagText>
  )
}
```

### `useRag` hook

For more control, attach the hook to any element via ref:

```tsx
import { useRag } from 'rag-rub'

export default function Paragraph({ children }) {
  const { ref } = useRag({ ragDifference={80}, maxTracking={0.7} })
  return <p ref={ref}>{children}</p>
}
```

### Vanilla JS (no React)

```ts
import { applyRag, removeRag } from 'rag-rub'

const el = document.querySelector('p')
const original = el.innerHTML

applyRag(el, original, { ragDifference: 80, maxTracking: 0.7 })

// Restore original markup
removeRag(el, original)
```

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `ragDifference` | `number` | `80` | How many pixels shorter even-numbered lines are vs. odd lines. Higher = more pronounced zigzag rag. |
| `maxTracking` | `number` | `0.7` | Maximum `letter-spacing` in pixels per line. Prevents very short lines from being stretched. |

---

## How it works

The algorithm runs five passes on the target element:

1. **Reset** — restore the element to its original HTML snapshot
2. **Widow removal** — replace the last space in each block with `&nbsp;` to prevent orphaned final words
3. **Word wrap** — wrap every word in a measurement `<span>`
4. **Line grouping** — walk word spans, accumulate pixel widths, break into line spans when the ideal line width is reached (alternating full / shortened)
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
