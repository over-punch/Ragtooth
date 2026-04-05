# Product Context — Rag-Rub

## The Problem
CSS `text-align: left` produces a "rag" — the irregular right edge of a text block. Left unchecked, the rag can look bad: notches, peninsulas, near-rivers, or a staircase pattern. Professional typographers spend real time fixing this manually in layout software (InDesign, etc.), but on the web there's no native control.

Existing tools (ragadjust, etc.) exist but are old, jQuery-dependent, or tightly coupled to specific build systems.

## Who It's For
- Typographers and type designers working on the web
- Front-end developers who care about typographic quality
- Anyone building or maintaining a web project where text quality matters

## What Success Looks Like
- Paste or type text into the tool
- Tweak rag settings (aggressiveness, target shape, constraints)
- Copy the adjusted HTML — or get a snippet/script — and drop it into a project
- The rag looks noticeably better without touching the original text content

## Desired Experience
- Fast and visual — see changes instantly
- Low friction — no build step required to try it
- Educational — help users understand what a "good rag" actually looks like
