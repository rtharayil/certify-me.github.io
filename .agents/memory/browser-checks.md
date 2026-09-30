---
name: Browser checks in this workspace
description: A local Playwright browser-cache mismatch and the dependable alternative for visual verification.
---

If Playwright fails to launch because its bundled Chromium headless shell is missing, check for a system Chromium installation and pass that executable to Playwright instead of treating the app as broken.

**Why:** The Playwright package can be present without the exact browser revision it expects, while the workspace still has a working Chromium binary. Installing another browser adds unnecessary setup for a simple site check.

**How to apply:** Run `which chromium` and use the resulting path as Playwright's `executablePath` for local responsive and interaction checks. This is a test-environment workaround, not an app dependency.