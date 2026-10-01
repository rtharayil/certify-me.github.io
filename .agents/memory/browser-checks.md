---
name: Browser checks in this workspace
description: A local Playwright browser-cache mismatch and the dependable alternative for visual verification.
---

If Playwright fails to launch because its bundled Chromium headless shell is missing, check for a system Chromium installation and pass that executable to Playwright instead of treating the app as broken.

**Why:** The Playwright package can be present without the exact browser revision it expects, while the workspace still has a working Chromium binary. Installing another browser adds unnecessary setup for a simple site check.

**How to apply:** Run `which chromium` and use the resulting path as Playwright's `executablePath` for local responsive and interaction checks. This is a test-environment workaround, not an app dependency.

Keep a CDP touch-input session alive for the lifetime of its emulated phone page; let closing the browser context clean it up.

**Why:** In the installed Chromium, detaching a secondary CDP session after dispatching touch input reset the page's touch emulation: the primary pointer changed from coarse to fine and maxTouchPoints became zero. This made later landscape assertions exercise desktop mode even though the context was created as a phone.

**How to apply:** Reuse one session per page for genuine swipe checks. Verify touch capability after gestures before diagnosing responsive failures as app bugs.