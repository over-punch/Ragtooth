# Typography & Rag Research Tracker

Living bibliography of references relevant to Rag-Rub's line-breaking and rag-shaping approach.
Update this file when new research or tooling references are found.

---

## Related Tools & Prior Art

### ragadjust (Nathan Ford)
- **Source**: https://github.com/nathanford/ragadjust
- **Approach**: jQuery plugin; inserts soft hyphens and non-breaking spaces to smooth ragged text
- **Status**: Reference implementation — understand its algorithm before diverging

### ragadjust (aperfect fork)
- **Source**: https://github.com/aperfect/ragadjust
- **Notes**: Fork of Nathan Ford's original; may contain bug fixes or alternate strategies

### jekyll-ragadjust
- **Source**: https://github.com/eulenherr/jekyll-ragadjust
- **Notes**: Jekyll integration; useful reference for static-site use cases

### grunt-raggedast
- **Source**: https://github.com/adamhavel/grunt-raggedast
- **Notes**: Build-tool integration; offline/pre-processing approach vs. runtime

### wp_php_ragadjust
- **Source**: https://github.com/arnoesterhuizen/wp_php_ragadjust
- **Notes**: PHP/WordPress port; shows server-side approach

---

## Typography References

### Robert Bringhurst — "The Elements of Typographic Style"
- **Relevance**: Authoritative source on what constitutes a good rag; defines "good rag" as irregular but not jagged, avoiding shapes like notches, peninsulas, or wedges
- **Status**: Core reference for what the tool should optimize for

### The Chicago Manual of Style — Ragged Right Setting
- **Relevance**: Defines acceptable rag variance in editorial contexts
- **Status**: Useful for defining quality thresholds

---

## Notes for Future Research

- Look for CSS `text-wrap: balance` / `text-wrap: pretty` browser support — may overlap with or complement this tool's goals
- Investigate `&shy;` (soft hyphen) vs. `&#8203;` (zero-width space) browser consistency
- Research line-length guidelines (45–75 characters optimal) and how they affect rag perception
