# Product Context — Ragtooth

## The Problem
CSS `text-align: left` produces a "rag" — the irregular right edge of a text block. Left unchecked it looks accidental: notches, peninsulas, near-rivers. Professional typographers fix this manually in InDesign; on the web there's no native control. Existing tools are old and jQuery-dependent.

## Who It's For
- Typographers and type-conscious developers working on the web
- React and vanilla JS projects where text quality matters
- Anyone who has stared at a paragraph thinking "that rag is a mess"

## What Success Looks Like
- One prop (`sawDepth`) is enough to get a clean sawtooth pattern
- Works on any font, any size, any container width — recalculates on resize
- Inline elements (`<em>`, `<strong>`, `<a>`) are preserved through the algorithm
- Zero visual cost: tracking compensation keeps lines looking optically full

## Desired Experience
- Drop-in: `<RagText sawDepth={120}>paragraph</RagText>` and it's done
- Educational landing page that lets users feel the settings live
- Good defaults: `sawPeriod: 2`, `sawAlign: 'bottom'`, `sawPhase: 1` avoids awkward short-penultimate-line effect
