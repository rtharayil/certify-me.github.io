---
name: Native disclosures and sticky containment
description: Why wrapping a sticky grid item in native details needs browser-level scroll verification.
---

When native details wraps a sticky grid item, keep the sticky positioning on the direct grid-level disclosure wrapper rather than relying on a sticky child inside the native content box.

**Why:** In Chromium, setting display:contents on the details wrapper did not restore the descendant's original sticky containment. The card scrolled behind the header despite its computed position still being sticky.

**How to apply:** When adding mobile disclosures to a shared desktop layout, verify actual scrolling and unobscured card bounds on desktop. Preserve an ordinary, nonsticky disclosure on mobile.