---
description: Preview the rag tool in the browser
argument-hint: [port]
---

Start a local dev server and open the tool for visual testing.

!`npm run dev 2>&1 | head -20`

Open http://localhost:${ARGUMENTS:-3000} and test rag adjustment with sample text at various container widths.

Check:
1. Does the rag shape update in real time as settings change?
2. Does it work across different font sizes and line lengths?
3. Are edge cases handled (single word, very long words, empty input)?
