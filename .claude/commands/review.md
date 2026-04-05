---
description: Review current branch changes for issues before merging
---

## Changed Files

!`git diff --name-only main...HEAD 2>/dev/null || git diff --name-only HEAD~5`

## Full Diff

!`git diff main...HEAD 2>/dev/null || git diff HEAD~5`

Review the above changes for:

1. **Rag algorithm correctness** — Does the line-breaking / rag-shaping logic produce consistent output across edge cases?
2. **Typography accuracy** — Are measurements (em, rem, ch units) handled correctly? Are font metrics respected?
3. **Cross-browser rendering** — Any CSS or JS that may behave differently across browsers?
4. **Performance** — No unnecessary reflows/repaints; heavy DOM operations are batched
5. **Accessibility** — Text remains readable; no contrast or layout regressions
6. **Security** — No hardcoded API keys, no exposed secrets, no XSS vectors

Give specific, actionable feedback per file.
