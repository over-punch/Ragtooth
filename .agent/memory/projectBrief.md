# Project Brief — Ragtooth

## What it is
A typographic tool that adjusts the shape of a text block's rag (the uneven right edge of left-aligned text).

## Origin
Started as a CodePen: https://codepen.io/QuiteQuinn/pen/pobqxWX
Now being converted into a proper standalone project.

## Core Goal
Give typographers and designers fine-grained control over the rag of a text block — smoothing it, shaping it, or otherwise optimizing it beyond what CSS alone can do.

## Scope
- Input: arbitrary text content
- Output: the same text with soft hyphens (`&shy;`), non-breaking spaces (`&nbsp;`), or other invisible characters inserted to reshape the line endings
- Visual feedback: real-time preview of rag shape as settings change

## What it is NOT
- Not a full text editor
- Not a hyphenation engine (though it may use soft hyphens as a tool)
- Not a CMS or publishing platform

## Prior Art (reference, not copy)
- https://github.com/nathanford/ragadjust — original jQuery plugin, primary reference
- https://github.com/aperfect/ragadjust — fork
- https://github.com/eulenherr/jekyll-ragadjust — Jekyll integration
- https://github.com/adamhavel/grunt-raggedast — Grunt build-tool approach
- https://github.com/arnoesterhuizen/wp_php_ragadjust — PHP/WordPress port
