---
description: Run full quality checks (lint, test, build)
---

Run all quality checks in sequence:

!`npm run lint 2>&1`
!`npm test 2>&1`
!`npm run build 2>&1 | tail -30`

Report any failures with file locations and suggested fixes.
