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

Use the actual scrolling ancestor when capturing mobile homepage sections; do not assume the window is the scroll container.

**Why:** The mobile homepage can scroll the body independently. Window scrolling left the view at the hero, while tall element screenshots clipped off-screen text and placed fixed navigation across the captured section. Unsettled scrolling and unloaded lazy images can also make a temporary capture look like a permanent spacing defect.

**How to apply:** Start with element.scrollIntoView using instant behavior, inspect the nearest scrollable ancestor, and adjust that ancestor for the fixed header without smooth scrolling. Wait for visible lazy images to load and decode. Confirm the target's viewport bounds and capture reading viewports rather than treating one tall element image as reliable visual evidence.

Keep browser configuration and cache state outside the watched Jekyll workspace when running local browser checks.

**Why:** System Chromium wrote crash-report settings beneath the workspace's `.config` directory while tests ran. Jekyll treated those browser-state changes as source edits and repeatedly regenerated the site; image decoding could fail transiently even though the asset was intact and returned HTTP 200.

**How to apply:** If browser checks cause unexpected regeneration or intermittent asset failures, inspect the watcher logs before changing artwork or application code. Use temporary directories for browser configuration/cache where possible, and wait for the actual lazy-loaded image to load before decoding it.