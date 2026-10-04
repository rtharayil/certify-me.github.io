---
name: Browser checks in this workspace
description: Workspace browser quirks affecting responsive images, touch input, Jekyll watching, and body-scrolling anchors.
---

If Playwright fails to launch because its bundled Chromium headless shell is missing, check for a system Chromium installation and pass that executable to Playwright instead of treating the app as broken.

**Why:** The Playwright package can be present without the exact browser revision it expects, while the workspace still has a working Chromium binary. Installing another browser adds unnecessary setup for a simple site check.

**How to apply:** Run `which chromium` and use the resulting path as Playwright's `executablePath` for local responsive and interaction checks. This is a test-environment workaround, not an app dependency.

Shell verification commands do not inherit the managed preview workflow's runtime configuration.

**Why:** A working sandbox preview could not be built from an ordinary shell until its workflow-supplied runtime metadata was also provided. This looked like a broken build environment even though the preview and dependencies worked.

**How to apply:** Check declared configuration requirements and workflow status before attempting dependency repairs. Supply the matching non-secret workflow metadata for one-off build checks; do not alter application defaults to bypass required configuration.

Keep a CDP touch-input session alive for the lifetime of its emulated phone page; let closing the browser context clean it up.

**Why:** In the installed Chromium, detaching a secondary CDP session after dispatching touch input reset the page's touch emulation: the primary pointer changed from coarse to fine and maxTouchPoints became zero. This made later landscape assertions exercise desktop mode even though the context was created as a phone.

**How to apply:** Reuse one session per page for genuine swipe checks. Verify touch capability after gestures before diagnosing responsive failures as app bugs.

Use the actual scrolling ancestor when capturing mobile homepage sections or checking native anchors; do not assume the window is the scroll container.

**Why:** The mobile site can scroll the body independently, even when document.scrollingElement reports HTML. Window scrolling left the view at the hero, while tall element screenshots clipped off-screen text and placed fixed navigation across the captured section. Native anchors could also land below the fixed header after closing a dialog despite a CSS scroll margin. Unsettled scrolling and unloaded lazy images can make a temporary capture look like a permanent spacing defect.

**How to apply:** Start with element.scrollIntoView using instant behavior, inspect the nearest scrollable ancestor, and adjust that ancestor for the fixed header without smooth scrolling. Wait for visible lazy images to load and decode. Compare actual anchor bounds with the visible header, not just a CSS declaration. Capture reading viewports rather than treating one tall element image as reliable evidence. Do not assume a hash URL alone produced a settled section capture.

Verify visibility after scrolling when reusing legacy animated sections; valid geometry and loaded artwork do not guarantee that their text is displayed.

**Why:** Legacy WOW effects left relocated review content hidden on mobile even after a bounded wait. This was distinct from the transient lazy-image and unsettled-scroll captures above.

**How to apply:** Keep readable content independent of unreliable entrance-animation visibility, scoping any override to the affected page so unrelated pages retain their behavior.

Keep browser configuration and cache state outside the watched Jekyll workspace when running local browser checks.

**Why:** System Chromium wrote crash-report settings beneath the workspace's `.config` directory while tests ran. Jekyll treated those browser-state changes as source edits and repeatedly regenerated the site; image decoding could fail transiently even though the asset was intact and returned HTTP 200.

**How to apply:** If browser checks cause unexpected regeneration or intermittent asset failures, inspect the watcher logs before changing artwork or application code. Use temporary directories for browser configuration/cache where possible, and wait for the actual lazy-loaded image to load before decoding it.

Restart the long-running Jekyll watcher after adding or changing a plugin, before trusting a fresh standalone build's output.

**Why:** A watcher with the old plugin registry regenerated the shared output directory after a successful standalone build and erased the new plugin's changes. This made a passing image-dimension audit appear to regress.

**How to apply:** Restart once after the plugin batch, build the current source, and run the final audits against that output. Avoid concurrent generators with different loaded plugin versions.

Distinguish a browser transport failure from a broken interaction when HTML loads but its script does not.

**Why:** System Chromium encountered `ERR_CERT_VERIFIER_CHANGED` on the proxied preview's assets. The homepage rendered, but the missing dialog script made a working opener appear broken.

**How to apply:** Inspect failed network requests as well as JavaScript exceptions. If transport is unreliable, check that the server serves the intended bytes and isolate the component's behavior separately; do not change production TLS or rewrite working application logic to satisfy a faulty browser session.

Preserve intrinsic HTML dimensions, but verify the complementary CSS dimension when resizing responsive images or fixed-height logos.

**Why:** Reserving intrinsic dimensions exposed older rules that changed only width or only height, visibly distorting illustrations and logos. A width-and-height attribute audit can pass while rendered proportions are wrong.

**How to apply:** Keep intrinsic attributes for layout stability; use automatic height for responsive-width illustrations and automatic width for fixed-height logos. Capped uncropped thumbnails need automatic dimensions together. Check rendered proportions at desktop/mobile sizes and exclude deliberate contain/cover crops from distortion failures.

Do not require original-file natural dimensions from responsive images using width descriptors.

**Why:** Chromium reports density-corrected integer natural dimensions for srcset images. Small logos can have an apparently different aspect ratio simply because their corrected height rounds to a few pixels.

**How to apply:** Verify candidate files against their declared widths and source proportions. For browser regression checks, decode currentSrc in a separate Image without srcset to recover the selected resource's unrounded ratio; otherwise allow about one pixel of density-corrected rounding. Retain strict original width/height attribute checks for reserved layout space.

Prefer the selected resource's unrounded ratio over a generous percentage tolerance for small responsive logos.

**Why:** Density-corrected heights can round to only a few pixels, making an undistorted logo appear substantially stretched. Raising a global ratio tolerance would also let genuinely squeezed images pass.

**How to apply:** Keep the corrected natural dimensions in diagnostic reports, but use the independently decoded selected resource for the proportion assertion. Keep only a small layout/subpixel tolerance.