# Ragtooth

[![npm](https://img.shields.io/npm/v/ragtooth.svg)](https://www.npmjs.com/package/ragtooth) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![part of liiift type-tools](https://img.shields.io/badge/liiift-type--tools-blueviolet)](https://github.com/Liiift-Studio/type-tools)

A sawtooth rag, on the web. Shapes text into alternating long/short lines — the kind of typographic rhythm that reads as design, not accident.

**[ragtooth.com](https://ragtooth.com)** · [npm](https://www.npmjs.com/package/ragtooth) · [GitHub](https://github.com/Liiift-Studio/Ragtooth)

---

## Install

```bash
npm install ragtooth
```

## Usage

```tsx
import { RagText } from 'ragtooth'

<RagText sawDepth={120} sawPeriod={2}>
  Your paragraph text here...
</RagText>
```

See [ragtooth.com](https://ragtooth.com) for full API docs and a live demo.

---

## Dev notes

### `next` in root devDependencies

`package.json` at the repo root lists `next` as a devDependency. This is a **Vercel detection workaround** — not a real dependency of the npm package. Vercel's build system inspects the root `package.json` to detect the framework; without `next` present it falls back to a static build and skips the Next.js pipeline, breaking the `/site` subdirectory deploy.

The package itself has zero runtime dependencies. Do not remove this entry.

---

Current version: v1.2.23
