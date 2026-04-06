# Project Brief — Ragtooth

## What it is
`ragtooth` — an npm package that applies deliberate sawtooth rag typographic shaping to text. Alternates long and short lines to create a rhythmic, intentional right edge instead of an accidental ragged one.

## Package identity
- npm: `ragtooth`
- GitHub: `quitequinn/Ragtooth` (code) + `Liiift-Studio/Ragtooth` (Vercel deploy trigger)
- Site: `ragtooth.liiift.studio`
- Author: Quinn Keaveney / Liiift Studio

## Core Goal
Give typographers and web developers a single-prop drop-in to deliberately shape paragraph rag into a sawtooth pattern — a technique from editorial and book design.

## Scope
- Core algorithm: framework-agnostic DOM mutation (`applyRag`, `removeRag`, `getCleanHTML`)
- React bindings: `useRag` hook + `RagText` component
- Landing site: Next.js 16 app with interactive demo (variable font, live sliders)

## What it is NOT
- Not a line-breaking / hyphenation library
- Not a CSS-only solution
- Not a full typesetting system

## Prior Art
- ragadjust (jQuery, primary inspiration) — https://github.com/nathanford/ragadjust
- Jekyll, Grunt, and PHP ports of the same concept
